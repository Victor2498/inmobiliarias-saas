from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.application.services.whatsapp_manager import WhatsAppManagerService
from app.api.deps import PlanChecker, get_current_user

router = APIRouter()

@router.get("/status")
async def get_whatsapp_status(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    service = WhatsAppManagerService(db)
    return await service.sync_status(user.tenant_id)

@router.post("/connect")
async def connect_whatsapp(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    _ = Depends(PlanChecker(["basic", "premium"]))
):
    service = WhatsAppManagerService(db)
    return await service.get_or_create_connection(user.tenant_id)

@router.post("/logout")
async def logout_whatsapp(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    service = WhatsAppManagerService(db)
    if await service.logout_whatsapp(user.tenant_id):
        return {"message": "Sesión cerrada correctamente"}
    
    raise HTTPException(status_code=500, detail="Error al cerrar sesión en el servidor")
