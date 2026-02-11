from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.api.deps import get_db, get_current_user, RoleChecker
from app.infrastructure.persistence.models import TenantModel
from app.infrastructure.persistence.business_models import ChargeModel, PaymentModel
from app.application.services.mercado_pago import MercadoPagoService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/preference/charge/{charge_id}")
async def get_charge_preference(charge_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Genera una URL de pago para una liquidacion de alquiler"""
    charge = db.query(ChargeModel).filter(ChargeModel.id == charge_id).first()
    if not charge:
        raise HTTPException(status_code=404, detail="Cargo no encontrado")
    
    mp_service = MercadoPagoService()
    preference = mp_service.create_charge_preference(
        charge_id=charge.id,
        description=charge.description,
        amount=charge.amount
    )
    
    if not preference:
        raise HTTPException(status_code=500, detail="Error al generar preferencia de pago")
        
    return {"init_point": preference["init_point"]}

@router.post("/upgrade-plan")
async def create_upgrade_preference(new_plan: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Genera una URL de pago para que la inmobiliaria suba de plan SaaS"""
    # Precios simulados
    PLAN_PRICES = {"basic": 5000.0, "premium": 15000.0}
    if new_plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Plan invalido")
    
    tenant = db.query(TenantModel).filter(TenantModel.id == current_user.tenant_id).first()
    
    mp_service = MercadoPagoService()
    preference = mp_service.create_plan_upgrade_preference(
        tenant_id=tenant.id,
        plan_name=new_plan,
        amount=PLAN_PRICES[new_plan],
        email=tenant.email
    )
    
    if not preference:
        raise HTTPException(status_code=500, detail="Error al generar preferencia de upgrade")
        
    return {"init_point": preference["init_point"]}

@router.post("/webhook")
async def mp_webhook(request: Request, background_tasks: BackgroundTasks):
    """Recibe notificaciones de pago de Mercado Pago"""
    data = await request.json()
    logger.info(f"MP Webhook received: {data}")
    
    # MP envia notificaciones de varios tipos. Nos interesa 'payment'
    if data.get("type") == "payment":
        payment_id = data.get("data", {}).get("id")
        if payment_id:
            background_tasks.add_task(process_payment, payment_id)
            
    return {"status": "ok"}

async def process_payment(payment_id: str):
    """Lógica de fondo para consultar MP y actualizar la DB local"""
    db = SessionLocal()
    try:
        mp_service = MercadoPagoService()
        payment_info = mp_service.sdk.payment().get(payment_id)
        
        if payment_info["status"] == 200:
            response = payment_info["response"]
            status = response.get("status")
            external_ref = response.get("external_reference", "")
            
            if status == "approved":
                if external_ref.startswith("charge_"):
                    # Es un pago de alquiler
                    charge_id = int(external_ref.split("_")[1])
                    charge = db.query(ChargeModel).filter(ChargeModel.id == charge_id).first()
                    if charge:
                        charge.is_paid = True
                        db.add(PaymentModel(
                            tenant_id=charge.tenant_id,
                            charge_id=charge.id,
                            amount=response.get("transaction_amount"),
                            payment_method="MERCADOPAGO",
                            transaction_id=str(payment_id)
                        ))
                        db.commit()
                        logger.info(f"Cobro {charge_id} marcado como pagado via MP")
                
                elif external_ref.startswith("upgrade_"):
                    # Es un upgrade de plan SaaS
                    _, tenant_id, new_plan = external_ref.split("_")
                    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
                    if tenant:
                        tenant.plan = new_plan
                        db.commit()
                        logger.info(f"Tenant {tenant_id} subio al plan {new_plan} satisfactoriamente")
    except Exception as e:
        logger.error(f"Error procesando pago {payment_id}: {e}")
    finally:
        db.close()
