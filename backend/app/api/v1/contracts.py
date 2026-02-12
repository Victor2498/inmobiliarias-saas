from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker, PlanChecker
from app.domain.schemas.contract import ContractCreate, ContractResponse, ChargeResponse
from app.application.services.contract_service import ContractService
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ContractResponse])
def list_contracts(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    service = ContractService(db)
    return service.list_contracts(skip=skip, limit=limit)

@router.post("/", response_model=ContractResponse)
def create_contract(contract_in: ContractCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = ContractService(db)
    return service.create_contract(contract_in)

@router.post("/generate-monthly-charges")
async def generate_charges(month: int, year: int, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN"])), _ = Depends(PlanChecker(["basic", "premium"]))):
    """Genera cargos para todos los contratos del tenant logueado"""
    service = ContractService(db)
    count = service.generate_monthly_charges(month, year)
    return {"message": f"Se generaron {count} cargos exitosamente"}

@router.get("/charges", response_model=List[ChargeResponse])
def list_charges(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Lista todos los cargos (liquidaciones) para el tenant actual"""
    service = ContractService(db)
    return service.list_charges()

@router.get("/{id}/preview-adjustment")
async def preview_adjustment(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(PlanChecker(["basic", "premium"]))):
    """Previsualiza el ajuste ILC para un contrato especifico"""
    service = ContractService(db)
    new_rent = await service.preview_adjustment(id)
    if new_rent is None:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return {"new_rent": new_rent}
