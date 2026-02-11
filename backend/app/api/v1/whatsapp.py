from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.middleware import get_current_tenant_id
from app.infrastructure.persistence.models import TenantModel, WhatsAppInstanceModel
from app.services.whatsapp_service import whatsapp_service
import uuid

router = APIRouter()

@router.get("/status")
async def get_whatsapp_status(
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant_id)
):
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant or not tenant.whatsapp_enabled:
        raise HTTPException(status_code=403, detail="WhatsApp no está habilitado para esta cuenta")

    instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).first()
    
    if not instance:
        return {"status": "NOT_CREATED"}
    
    # Actualizar estado desde Evolution API
    current_status = await whatsapp_service.get_instance_status(instance.instance_name)
    instance.status = current_status
    db.commit()
    
    return {
        "status": instance.status,
        "instance_name": instance.instance_name,
        "last_connected": instance.last_connected_at
    }

@router.post("/connect")
async def connect_whatsapp(
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant_id)
):
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant or not tenant.whatsapp_enabled:
        raise HTTPException(status_code=403, detail="WhatsApp no está habilitado")

    instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).first()
    
    instance_name = f"tenant_{tenant_id}"
    
    if not instance:
        # Crear instancia en Evolution API
        resp = await whatsapp_service.create_instance(instance_name)
        
        instance = WhatsAppInstanceModel(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            instance_name=instance_name,
            status="QR_PENDING"
        )
        db.add(instance)
        db.commit()
    
    # Obtener QR
    qr_base64 = await whatsapp_service.get_qr_code(instance_name)
    if not qr_base64:
        # Si falló, intentar recrear (caso de instancia que no existe en Evolution pero sí en DB)
        await whatsapp_service.create_instance(instance_name)
        qr_base64 = await whatsapp_service.get_qr_code(instance_name)

    return {"qr": qr_base64, "status": "QR_PENDING"}

@router.post("/logout")
async def logout_whatsapp(
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant_id)
):
    instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instancia no encontrada")
    
    success = await whatsapp_service.logout_instance(instance.instance_name)
    if success:
        instance.status = "DISCONNECTED"
        db.commit()
        return {"message": "Sesión cerrada"}
    
    raise HTTPException(status_code=500, detail="Error al cerrar sesión")
