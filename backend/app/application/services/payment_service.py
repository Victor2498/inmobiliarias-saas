import logging
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.domain.models.tenant import TenantModel
from app.domain.models.business import ChargeModel, PaymentModel
from app.application.services.mercado_pago import MercadoPagoService

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BaseRepository(PaymentModel, db)
        self.mp_service = MercadoPagoService()

    def list_payments(self, skip: int = 0, limit: int = 100) -> List[PaymentModel]:
        return self.repo.list(
            skip=skip,
            limit=limit,
            options=[joinedload(PaymentModel.charge)]
        )

    def get_charge_preference(self, charge_id: int) -> str:
        charge = self.db.query(ChargeModel).filter(ChargeModel.id == charge_id).first()
        if not charge:
            raise HTTPException(status_code=404, detail="Cargo no encontrado")
        
        preference = self.mp_service.create_charge_preference(
            charge_id=charge.id,
            description=charge.description,
            amount=charge.amount
        )
        
        if not preference:
            raise HTTPException(status_code=500, detail="Error al generar preferencia de pago")
            
        return preference["init_point"]

    def create_upgrade_preference(self, tenant_id: str, new_plan: str) -> str:
        PLAN_PRICES = {"basic": 5000.0, "premium": 15000.0}
        if new_plan not in PLAN_PRICES:
            raise HTTPException(status_code=400, detail="Plan invalido")
        
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")
        
        preference = self.mp_service.create_plan_upgrade_preference(
            tenant_id=tenant.id,
            plan_name=new_plan,
            amount=PLAN_PRICES[new_plan],
            email=tenant.email
        )
        
        if not preference:
            raise HTTPException(status_code=500, detail="Error al generar preferencia de upgrade")
            
        return preference["init_point"]

    async def process_webhook_payment(self, payment_id: str):
        """
        Procesa el pago notificado por el webhook de MP.
        """
        try:
            payment_info = self.mp_service.sdk.payment().get(payment_id)
            if payment_info["status"] != 200:
                logger.error(f"Error consultando pago {payment_id} en MP")
                return

            response = payment_info["response"]
            status = response.get("status")
            external_ref = response.get("external_reference", "")
            
            if status == "approved":
                # Control Idempotencia
                existing = self.db.query(PaymentModel).filter(PaymentModel.transaction_id == str(payment_id)).first()
                if existing:
                    return

                if external_ref.startswith("charge_"):
                    self._process_charge_payment(external_ref, response, payment_id)
                elif external_ref.startswith("upgrade_"):
                    self._process_upgrade_payment(external_ref, response, payment_id)
                
                self.db.commit()
        except Exception as e:
            logger.error(f"Error procesando pago {payment_id}: {e}")
            self.db.rollback()

    def _process_charge_payment(self, external_ref: str, response: dict, payment_id: str):
        charge_id = int(external_ref.split("_")[1])
        charge = self.db.query(ChargeModel).filter(ChargeModel.id == charge_id).first()
        
        if charge and not charge.is_paid:
            charge.is_paid = True
            self.db.add(PaymentModel(
                tenant_id=charge.tenant_id,
                charge_id=charge.id,
                amount=response.get("transaction_amount"),
                payment_method="MERCADOPAGO",
                transaction_id=str(payment_id),
                metadata={"mp_response": response}
            ))
            logger.info(f"Cobro {charge_id} confirmado")

    def _process_upgrade_payment(self, external_ref: str, response: dict, payment_id: str):
        parts = external_ref.split("_")
        if len(parts) < 3: return
        tenant_id, new_plan = parts[1], parts[2]
        
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if tenant:
            tenant.plan = new_plan
            self.db.add(PaymentModel(
                tenant_id=tenant_id,
                amount=response.get("transaction_amount"),
                payment_method="MERCADOPAGO_UPGRADE",
                transaction_id=str(payment_id),
                metadata={"new_plan": new_plan}
            ))
            logger.info(f"Inmobiliaria {tenant_id} upgrade a {new_plan}")
