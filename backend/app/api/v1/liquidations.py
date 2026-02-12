from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.domain.schemas.liquidation import LiquidationCreate, LiquidationResponse, LiquidationItemResponse
from app.application.services.liquidation_service import LiquidationService
from typing import List

router = APIRouter()

@router.post("/", response_model=LiquidationResponse)
def create_liquidation_draft(
    liquidation_in: LiquidationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Creates a new liquidation draft for a contract and period.
    Auto-populates items from contract concepts.
    """
    service = LiquidationService(db)
    try:
        return service.create_draft(liquidation_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{id}", response_model=LiquidationResponse)
def get_liquidation(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LiquidationService(db)
    liquidation = service.get_liquidation(id)
    if not liquidation:
        raise HTTPException(status_code=404, detail="Liquidation not found")
    return liquidation

@router.post("/{id}/confirm", response_model=LiquidationResponse)
def confirm_liquidation(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Finalizes the liquidation, generates PDF and sends via WhatsApp.
    """
    service = LiquidationService(db)
    try:
        return service.finalize_liquidation(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
