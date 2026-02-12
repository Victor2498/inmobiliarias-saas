from sqlalchemy.orm import Session
from app.domain.models.billing import LiquidationModel, LiquidationItemModel, ContractConceptModel, LiquidationStatus
from app.domain.models.business import ContractModel
from app.domain.schemas.liquidation import LiquidationCreate, LiquidationUpdate
from app.infrastructure.persistence.repository import BaseRepository
from datetime import datetime

class LiquidationService:
    def __init__(self, db: Session):
        self.db = db
        # Note: BaseRepository might need to be adjusted if it doesn't support custom methods
        # For now, we assume simple CRUD
        
    def create_draft(self, liquidation_in: LiquidationCreate) -> LiquidationModel:
        # 1. Verify contract exists
        contract = self.db.query(ContractModel).filter(ContractModel.id == liquidation_in.contract_id).first()
        if not contract:
            raise ValueError("Contract not found")

        # 2. Check if liquidation already exists for this period
        existing = self.db.query(LiquidationModel).filter(
            LiquidationModel.contract_id == liquidation_in.contract_id,
            LiquidationModel.period == liquidation_in.period
        ).first()

        if existing:
            raise ValueError(f"Liquidation for period {liquidation_in.period} already exists")

        # 3. Create Liquidation Header
        liquidation_data = liquidation_in.dict()
        liquidation_data["tenant_id"] = contract.tenant_id
        liquidation_data["total_amount"] = 0.0 # Will be calculated
        
        new_liquidation = LiquidationModel(**liquidation_data)
        self.db.add(new_liquidation)
        self.db.commit()
        self.db.refresh(new_liquidation)

        # 4. Auto-populate items from Contract Concepts
        concepts = self.db.query(ContractConceptModel).filter(
            ContractConceptModel.contract_id == contract.id
        ).all()

        total = 0.0
        for concept in concepts:
            item = LiquidationItemModel(
                liquidation_id=new_liquidation.id,
                concept_name=concept.concept_name,
                description="Concepto recurrente",
                current_value=concept.amount,
                previous_value=concept.amount, # Placeholder
                adjustment_applied=False,
                adjustment_percentage=0.0
            )
            self.db.add(item)
            total += concept.amount

        # Update total
        new_liquidation.total_amount = total
        self.db.commit()
        self.db.refresh(new_liquidation)
        
        return new_liquidation

    def get_liquidation(self, id: int) -> LiquidationModel:
        return self.db.query(LiquidationModel).filter(LiquidationModel.id == id).first()

    def calculate_icl_adjustment(self, liquidation_id: int):
        pass

    def finalize_liquidation(self, id: int):
        liquidation = self.get_liquidation(id)
        if not liquidation:
            raise ValueError("Liquidation not found")
        
        liquidation.status = LiquidationStatus.SENT.value
        liquidation.sent_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(liquidation)
        return liquidation
