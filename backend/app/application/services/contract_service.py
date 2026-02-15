from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domain.models.business import ContractModel, ChargeModel
from app.infrastructure.persistence.repository import BaseRepository
from app.domain.schemas.contract import ContractCreate, ContractUpdate
from app.application.services.contract_automation import ContractAutomationService
from app.application.services.rent_calculator_service import RentCalculatorService

class ContractService:
    def __init__(self, db: Session):
        self.db = db
        self.contract_repo = BaseRepository(ContractModel, db)
        self.charge_repo = BaseRepository(ChargeModel, db)
        self.automation_service = ContractAutomationService(db)
        self.rent_calculator = RentCalculatorService(db)

    def list_contracts(self, skip: int = 0, limit: int = 100) -> List[ContractModel]:
        return self.contract_repo.list(
            skip=skip, 
            limit=limit, 
            options=[joinedload(ContractModel.property), joinedload(ContractModel.person)]
        )

    def create_contract(self, contract_in: ContractCreate, tenant_id: Optional[str] = None) -> ContractModel:
        data = contract_in.model_dump(exclude_unset=True)
        data["current_rent"] = data["monthly_rent"]
        data["base_amount"] = data.get("base_amount") if data.get("base_amount") is not None else data["monthly_rent"]
        if tenant_id:
            data["tenant_id"] = tenant_id
        return self.contract_repo.create(data)

    def update_contract(self, contract_id: int, contract_in: ContractUpdate, tenant_id: Optional[str] = None) -> Optional[ContractModel]:
        contract = self.contract_repo.get(contract_id) if tenant_id else self.db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        if not contract:
            return None
        data = contract_in.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(contract, key, value)
        self.db.commit()
        self.db.refresh(contract)
        return contract

    def get_contract(self, contract_id: int, tenant_id: Optional[str] = None) -> Optional[ContractModel]:
        opts = [joinedload(ContractModel.property), joinedload(ContractModel.person)]
        if tenant_id:
            return self.contract_repo.get(contract_id, options=opts)
        return self.db.query(ContractModel).options(*opts).filter(ContractModel.id == contract_id).first()

    def list_charges(self) -> List[ChargeModel]:
        return self.charge_repo.list()

    def generate_monthly_charges(self, month: int, year: int) -> int:
        return self.automation_service.generate_monthly_charges(month, year)

    async def preview_adjustment(self, contract_id: int) -> Optional[dict]:
        """Previsualiza el ajuste usando RentCalculatorService. Devuelve {new_amount, percentage_increase}."""
        result = self.rent_calculator.calculate_adjustment(contract_id)
        if result is None:
            # Fallback al servicio anterior si no hay índices
            legacy = await self.automation_service.calculate_ilc_adjustment(contract_id)
            if legacy is not None:
                return {"new_amount": legacy, "percentage_increase": 0.0}
        return result
