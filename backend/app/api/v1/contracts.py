from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.business_models import ContractModel
from app.infrastructure.persistence.repository import BaseRepository
from app.api.deps import get_current_user, RoleChecker
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ContractBase(BaseModel):
    property_id: int
    person_id: int
    start_date: datetime
    end_date: datetime
    monthly_rent: float
    currency: str = "ARS"
    adjustment_period: int = 12
    status: str = "ACTIVE"

class ContractCreate(ContractBase):
    pass

class ContractResponse(ContractBase):
    id: int
    tenant_id: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ContractResponse])
def list_contracts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = BaseRepository(ContractModel, db)
    return repo.list()

@router.post("/", response_model=ContractResponse)
def create_contract(contract_in: ContractCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    repo = BaseRepository(ContractModel, db)
    return repo.create(contract_in.dict())
