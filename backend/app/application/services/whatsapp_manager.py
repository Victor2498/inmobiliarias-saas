from sqlalchemy.orm import Session
from app.infrastructure.persistence.models import WhatsAppInstanceModel, TenantModel
from app.services.whatsapp_service import whatsapp_service
from fastapi import HTTPException
import uuid

class WhatsAppManagerService:
    def __init__(self, db: Session):
        self.db = db

    async def get_or_create_connection(self, tenant_id: str) -> dict:
        """Coordina la obtencion de QR y estado de la instancia."""
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant or not tenant.whatsapp_enabled:
            raise HTTPException(status_code=403, detail="WhatsApp no habilitado")

        instance = self.db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).first()
        instance_name = f"tenant_{tenant_id}"

        if not instance:
            # Logica de creacion (Application Logic)
            await whatsapp_service.create_instance(instance_name)
            instance = WhatsAppInstanceModel(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                instance_name=instance_name,
                status="QR_PENDING"
            )
            self.db.add(instance)
            self.db.commit()

        qr = await whatsapp_service.get_qr_code(instance_name)
        return {"qr": qr, "status": "QR_PENDING"}

    async def sync_status(self, tenant_id: str) -> dict:
        """Sincroniza el estado local con la realidad de Evolution API."""
        instance = self.db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).first()
        if not instance:
            return {"status": "NOT_CREATED"}

        current_status = await whatsapp_service.get_instance_status(instance.instance_name)
        instance.status = current_status
        self.db.commit()
        
        return {
            "status": instance.status,
            "instance_name": instance.instance_name,
            "last_connected": instance.last_connected_at
        }
