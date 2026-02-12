import logging
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.domain.models.business import ContractModel, ChargeModel
from app.infrastructure.security.tenant_context import get_current_tenant_id

logger = logging.getLogger(__name__)

class ContractAutomationService:
    def __init__(self, db: Session):
        self.db = db

    async def calculate_ilc_adjustment(self, contract_id: int, target_date: date = None):
        """
        Calcula el ajuste de alquiler basado en el indice ILC.
        Por ahora usa un indice estatico (simulado) hasta integrar la API oficial.
        """
        contract = self.db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        if not contract:
            return None
        
        # Simulación de ILC: Supongamos un 120% de inflación anual
        # En la realidad esto consultaria una tabla de indices historicos
        target_date = target_date or date.today()
        
        # Ejemplo: Si paso un año, el monto se duplica (simplificado)
        new_rent = contract.current_rent or contract.monthly_rent
        # Logica de ajuste pendiente de API Real
        
        return new_rent

    def generate_monthly_charges(self, month: int, year: int):
        """
        Genera cargos de alquiler para todos los contratos activos del inquilino actual.
        """
        tenant_id = get_current_tenant_id()
        active_contracts = self.db.query(ContractModel).filter(
            ContractModel.tenant_id == tenant_id,
            ContractModel.status == "ACTIVE"
        ).all()
        
        count = 0
        for contract in active_contracts:
            # Verificar si ya existe el cargo para este mes/año
            description = f"Alquiler {month}/{year}"
            exists = self.db.query(ChargeModel).filter(
                ChargeModel.contract_id == contract.id,
                ChargeModel.description == description
            ).first()
            
            if not exists:
                new_charge = ChargeModel(
                    tenant_id=tenant_id,
                    contract_id=contract.id,
                    description=description,
                    amount=contract.current_rent or contract.monthly_rent,
                    due_date=datetime(year, month, 10), # Vence el 10
                    is_paid=False
                )
                self.db.add(new_charge)
                count += 1
        
        self.db.commit()
        return count
