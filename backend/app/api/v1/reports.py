
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.application.services.reports_service import ReportsService
from app.domain.models.user import UserModel

router = APIRouter()

@router.get("/export-movements")
def export_movements(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Exporta un CSV con todos los movimientos financieros (Ingresos por cobros y Egresos por liquidaciones).
    """
    service = ReportsService(db)
    return service.export_financial_movements(current_user.tenant_id)
