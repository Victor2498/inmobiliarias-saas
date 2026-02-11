from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.business_models import ContractModel, ChargeModel
from app.infrastructure.persistence.repository import BaseRepository
from app.api.deps import get_current_user, RoleChecker, PlanChecker
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

class ChargeResponse(BaseModel):
    id: int
    description: str
    amount: float
    due_date: datetime
    is_paid: bool
    contract_id: int

    class Config:
        from_attributes = True

from app.application.services.contract_automation import ContractAutomationService

@router.get("/", response_model=List[ContractResponse])
def list_contracts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = BaseRepository(ContractModel, db)
    return repo.list()

@router.post("/", response_model=ContractResponse)
def create_contract(contract_in: ContractCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    repo = BaseRepository(ContractModel, db)
    # Inicializar current_rent con el monto base
    data = contract_in.dict()
    data["current_rent"] = data["monthly_rent"]
    return repo.create(data)

@router.post("/generate-monthly-charges")
async def generate_charges(month: int, year: int, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN"])), _ = Depends(PlanChecker(["basic", "premium"]))):
    """Genera cargos para todos los contratos del tenant logueado"""
    service = ContractAutomationService(db)
    count = service.generate_monthly_charges(month, year)
    return {"message": f"Se generaron {count} cargos exitosamente"}

@router.get("/charges", response_model=List[ChargeResponse])
def list_charges(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Lista todos los cargos (liquidaciones) para el tenant actual"""
    repo = BaseRepository(ChargeModel, db)
    return repo.list()

@router.get("/{id}/preview-adjustment")
async def preview_adjustment(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(PlanChecker(["basic", "premium"]))):
    """Previsualiza el ajuste ILC para un contrato especifico"""
    service = ContractAutomationService(db)
    new_rent = await service.calculate_ilc_adjustment(id)
    if new_rent is None:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return {"new_rent": new_rent}
