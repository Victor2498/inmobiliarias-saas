from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker, PlanChecker
from app.domain.schemas.contract import ContractCreate, ContractUpdate, ContractResponse, ChargeResponse
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

@router.get("/adjustments-this-month", response_model=List[ContractResponse])
def adjustments_this_month(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Contratos con ajuste en el mes actual (last_adjustment_date en este mes)."""
    from datetime import datetime
    service = ContractService(db)
    all_contracts = service.list_contracts(skip=0, limit=500)
    now = datetime.utcnow()
    result = [
        c for c in all_contracts
        if c.last_adjustment_date
        and c.last_adjustment_date.month == now.month
        and c.last_adjustment_date.year == now.year
    ]
    return result

@router.post("/", response_model=ContractResponse)
def create_contract(contract_in: ContractCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = ContractService(db)
    return service.create_contract(contract_in, tenant_id=current_user.tenant_id)

@router.get("/{id}", response_model=ContractResponse)
def get_contract(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = ContractService(db)
    contract = service.get_contract(id, tenant_id=current_user.tenant_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

@router.put("/{id}", response_model=ContractResponse)
def update_contract(id: int, contract_in: ContractUpdate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = ContractService(db)
    contract = service.update_contract(id, contract_in, tenant_id=current_user.tenant_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

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
    """Previsualiza el ajuste ICL/IPC para un contrato. Devuelve new_amount y percentage_increase."""
    service = ContractService(db)
    result = await service.preview_adjustment(id)
    if result is None:
        raise HTTPException(status_code=404, detail="Contrato no encontrado o sin índices")
    return result
