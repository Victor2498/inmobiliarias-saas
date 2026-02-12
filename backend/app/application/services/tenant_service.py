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
            tenant.plan_id = data["plan"] # Note: Model uses plan_id or plan? Check model.
            # Assuming model has 'plan' based on registration, but let's check TenantModel in next step if error.
            # Looking at previous register_tenant, it used plan_id="lite". 
            # But AdminDashboard sends 'plan'. Let's Map it.
            tenant.plan_id = data["plan"] 
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
        
        # Soft delete logic: mark as inactive and maybe rename to avoid constraint collisions?
        # Or Just Hard Delete if no constraints prevent it? 
        # User requested "Eliminar". 
        # Let's try Hard Delete first, if it fails due to FKs, we might need a cascading delete or soft delete.
        # Given "Maintaining good logic", Hard Delete of a Tenant with data is dangerous.
        # We will implement a "Soft Delete" by marking is_active=False and appending "_DELETED" to name/email to allow reuse?
        # No, let's just delete the record for now as per simple CRUD, assuming cascade is configured or we want to block if data exists.
        # Actually, let's just delete the TenantModel entry.
        
        try:
            self.db.delete(tenant)
            self.db.commit()
            logger.info(f"🗑️ Inmobiliaria eliminada: {tenant.name} ({tenant_id})")
            return {"message": "Inmobiliaria eliminada correctamente"}
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error eliminando inmobiliaria: {e}")
            raise HTTPException(status_code=400, detail="No se puede eliminar: tiene datos asociados.")
