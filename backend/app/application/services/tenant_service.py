import uuid
import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session
from pydantic import EmailStr

from app.domain.models.tenant import TenantModel
from app.domain.models.user import UserModel
from app.infrastructure.security import hashing
from app.application.services.verification_service import VerificationService

logger = logging.getLogger(__name__)

class TenantService:
    def __init__(self, db: Session):
        self.db = db

    def register_tenant(self, name: str, admin_email: EmailStr, admin_password: str, admin_full_name: str):
        from sqlalchemy import func
        name = name.strip()
        admin_email = admin_email.strip()

        # 1. Validar unicidad
        if self.db.query(TenantModel).filter(func.lower(TenantModel.name) == name.lower()).first():
            raise HTTPException(status_code=400, detail="Inmobiliaria ya registrada")
        
        if self.db.query(UserModel).filter(func.lower(UserModel.email) == admin_email.lower()).first():
            raise HTTPException(status_code=400, detail="Email de administrador ya en uso")

        # 2. Crear Tenant
        tenant_id = str(uuid.uuid4())[:8]
        new_tenant = TenantModel(
            id=tenant_id,
            name=name,
            # Simple slug generation
            email=admin_email, # Required by model check
            hashed_password="legacy_placeholder", # Legacy field, kept for consistency
            plan_id="lite",
            is_active=True
        )
        self.db.add(new_tenant)

        # 3. Crear Admin
        new_admin = UserModel(
            tenant_id=tenant_id,
            email=admin_email,
            hashed_password=hashing.get_password_hash(admin_password),
            full_name=admin_full_name,
            role="INMOBILIARIA_ADMIN",
            is_active=True,
            email_verified=True # Auto-verificado para pruebas
        )
        self.db.add(new_admin)
        self.db.flush() # Generate ID for new_admin

        # 4. Generar Token
        token = VerificationService.generate_token(new_admin.id, self.db)

        # 5. Commit
        self.db.commit()

        logger.info(f"✅ Nueva Inmobiliaria registrada: {name} (ID: {tenant_id})")

        return {
            "message": "Inmobiliaria registrada. Por favor, verifique su email para activar la cuenta.",
            "tenant_id": tenant_id
        }

    def update_tenant(self, tenant_id: str, data: dict):
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")

        if "name" in data:
            tenant.name = data["name"]
        if "email" in data:
            tenant.email = data["email"]
            # También actualizar el email del admin principal si coincide? 
            # Por simplicidad, solo actualizamos el contacto comercial del tenant por ahora.
        if "plan" in data:
            new_plan = data["plan"].lower()
            tenant.plan = new_plan
            tenant.plan_id = new_plan
            # Auto-activar WhatsApp si el plan lo incluye
            if new_plan in ["basic", "premium"]:
                tenant.whatsapp_enabled = True
        if "whatsapp_enabled" in data:
            tenant.whatsapp_enabled = data["whatsapp_enabled"]

        self.db.commit()
        self.db.refresh(tenant)
        logger.info(f"✏️ Inmobiliaria actualizada: {tenant.name} ({tenant_id})")
        return tenant

    def toggle_tenant_status(self, tenant_id: str):
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")
        
        tenant.is_active = not tenant.is_active
        self.db.commit()
        status_str = "Activada" if tenant.is_active else "Suspendida"
        logger.info(f"⏯️ Inmobiliaria {status_str}: {tenant.name} ({tenant_id})")
        return tenant

    def delete_tenant(self, tenant_id: str):
        tenant = self.db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")
        
        try:
            # FORCE DELETE LOGIC: Manually delete related records to avoid FK constraints
            # 1. Delete Financial/Operational Records
            # Liquidations & Items
            from app.domain.models.billing import LiquidationModel, LiquidationItemModel
            self.db.query(LiquidationItemModel).filter(LiquidationItemModel.tenant_id == tenant_id).delete(synchronize_session=False)
            self.db.query(LiquidationModel).filter(LiquidationModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Payments & Charges
            from app.domain.models.business import PaymentModel, ChargeModel
            self.db.query(PaymentModel).filter(PaymentModel.tenant_id == tenant_id).delete(synchronize_session=False)
            self.db.query(ChargeModel).filter(ChargeModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Contracts
            from app.domain.models.business import ContractModel
            self.db.query(ContractModel).filter(ContractModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # 2. Delete Core Business Entities
            # Properties & People
            from app.domain.models.business import PropertyModel, PersonModel
            self.db.query(PropertyModel).filter(PropertyModel.tenant_id == tenant_id).delete(synchronize_session=False)
            self.db.query(PersonModel).filter(PersonModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # 3. Delete System/Platform Entities
            # WhatsApp
            from app.domain.models.whatsapp import WhatsAppInstanceModel, WhatsAppSessionModel, WhatsAppMessageModel
            self.db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.tenant_id == tenant_id).delete(synchronize_session=False)
            self.db.query(WhatsAppSessionModel).filter(WhatsAppSessionModel.tenant_id == tenant_id).delete(synchronize_session=False)
            self.db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Users & Audit
            from app.domain.models.user import UserModel
            from app.domain.models.tenant import AuditLogModel
            self.db.query(AuditLogModel).filter(AuditLogModel.tenant_id == tenant_id).delete(synchronize_session=False)
            self.db.query(UserModel).filter(UserModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # 4. Finally Delete Tenant
            self.db.delete(tenant)
            self.db.commit()
            
            logger.info(f"🔥 Inmobiliaria ELIMINADA (Force Delete): {tenant.name} ({tenant_id})")
            return {"message": "Inmobiliaria y todos sus datos eliminados permanentemente"}

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error fatal eliminando inmobiliaria: {e}")
            raise HTTPException(status_code=500, detail=f"Error crítico eliminando datos: {str(e)}")
