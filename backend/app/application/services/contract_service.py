from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domain.models.business import ContractModel, ChargeModel
from app.infrastructure.persistence.repository import BaseRepository
from app.domain.schemas.contract import ContractCreate
from app.application.services.contract_automation import ContractAutomationService

class ContractService:
    def __init__(self, db: Session):
        self.db = db
        self.contract_repo = BaseRepository(ContractModel, db)
        self.charge_repo = BaseRepository(ChargeModel, db)
        self.automation_service = ContractAutomationService(db)

    def list_contracts(self, skip: int = 0, limit: int = 100) -> List[ContractModel]:
        return self.contract_repo.list(
            skip=skip, 
            limit=limit, 
            options=[joinedload(ContractModel.property), joinedload(ContractModel.person)]
        )

    def create_contract(self, contract_in: ContractCreate) -> ContractModel:
        data = contract_in.model_dump()
        data["current_rent"] = data["monthly_rent"]
        return self.contract_repo.create(data)

    def list_charges(self) -> List[ChargeModel]:
        return self.charge_repo.list()

    def generate_monthly_charges(self, month: int, year: int) -> int:
        return self.automation_service.generate_monthly_charges(month, year)

    async def preview_adjustment(self, contract_id: int) -> Optional[float]:
        return await self.automation_service.calculate_ilc_adjustment(contract_id)
