from sqlalchemy.orm import Session
from app.domain.models.tenant import TenantModel, WhatsAppInstanceModel
from app.infrastructure.persistence.repository import BaseRepository
from app.infrastructure.external.whatsapp_client import whatsapp_client
from fastapi import HTTPException
import logging
import uuid

logger = logging.getLogger(__name__)

class WhatsAppManagerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BaseRepository(WhatsAppInstanceModel, db)

    async def get_or_create_connection(self, tenant_id: str) -> dict:
        """Coordina la obtencion de QR y estado de la instancia."""
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            logger.error(f"❌ Tenant {tenant_id} no encontrado")
            raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")
            
        logger.info(f"🟢 Intento de conexión WhatsApp - Tenant: {tenant.name}, Plan: {tenant.plan}, Enabled: {tenant.whatsapp_enabled}")

        if not tenant.whatsapp_enabled:
            raise HTTPException(status_code=403, detail=f"WhatsApp no habilitado para el plan {tenant.plan}. Contacte a soporte.")

        instance = self.db.query(WhatsAppInstanceModel).filter(
            WhatsAppInstanceModel.tenant_id == tenant_id
        ).first()
        
        instance_name = f"tenant_{tenant_id}"

        if not instance:
            await whatsapp_client.create_instance(instance_name)
            instance = self.repo.create({
                "id": str(uuid.uuid4())[:8],
                "tenant_id": tenant_id,
                "instance_name": instance_name,
                "status": "QR_PENDING"
            })

        qr = await whatsapp_client.get_qr_code(instance_name)
        if not qr:
            raise HTTPException(
                status_code=503, 
                detail="No se pudo obtener el código QR. Verifique que la API de WhatsApp esté en línea y el token sea correcto."
            )
            
        return {"qr": qr, "status": "QR_PENDING"}

    async def sync_status(self, tenant_id: str) -> dict:
        """Sincroniza el estado local con la realidad de Evolution API."""
        instance = self.db.query(WhatsAppInstanceModel).filter(
            WhatsAppInstanceModel.tenant_id == tenant_id
        ).first()
        
        if not instance:
            return {"status": "NOT_CREATED"}

        current_status = await whatsapp_client.get_instance_status(instance.instance_name)
        instance.status = current_status
        self.db.commit()
        
        return {
            "status": instance.status,
            "instance_name": instance.instance_name,
            "last_connected": instance.last_connected_at
        }

    async def logout_whatsapp(self, tenant_id: str) -> bool:
        """Cierra la sesion de WhatsApp."""
        instance = self.db.query(WhatsAppInstanceModel).filter(
            WhatsAppInstanceModel.tenant_id == tenant_id
        ).first()
        
        if not instance:
            raise HTTPException(status_code=404, detail="Instancia no encontrada")
        
        success = await whatsapp_client.logout_instance(instance.instance_name)
        if success:
            instance.status = "DISCONNECTED"
            self.db.commit()
            return True
        return False
