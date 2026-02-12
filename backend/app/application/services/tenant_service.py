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
