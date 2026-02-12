import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.domain.models.tenant import TenantModel, AuditLogModel
from app.infrastructure.security import hashing

logger = logging.getLogger(__name__)

class AdminService:
    @staticmethod
    def create_tenant(db: Session, name: str, email: str, password: str, plan: str = "lite", whatsapp_enabled: bool = False, actor_id: int = None):
        # 1. Validar existencia
        existing = db.query(TenantModel).filter(TenantModel.name == name).first()
        if existing:
            return None, "El nombre de la inmobiliaria ya existe"
        
        # 2. Crear Tenant
        tenant_id = str(uuid.uuid4())[:18]
        new_tenant = TenantModel(
            id=tenant_id,
            name=name,
            email=email,
            hashed_password=hashing.get_password_hash(password),
            is_active=True,
            status="active",
            plan=plan,
            whatsapp_enabled=whatsapp_enabled,
            preferences={"theme": "light"}
        )
        db.add(new_tenant)
        db.flush() # Force ID creation for AuditLog FK
        
        # 3. Registrar en Auditoría
        AdminService.log_action(
            db, 
            actor_id=actor_id, 
            tenant_id=tenant_id, 
            action="CREATE_TENANT", 
            details={"name": name, "plan": plan}
        )
        
        db.commit()
        db.refresh(new_tenant)
        return new_tenant, None

    @staticmethod
    def update_tenant(db: Session, tenant_id: str, update_data: dict, actor_id: int = None):
        tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            return None, "Inmobiliaria no encontrada"
        
        old_values = {k: getattr(tenant, k) for k in update_data.keys() if hasattr(tenant, k)}
        
        for key, value in update_data.items():
            if hasattr(tenant, key):
                setattr(tenant, key, value)
        
        # 4. Auditoría de cambios
        AdminService.log_action(
            db,
            actor_id=actor_id,
            tenant_id=tenant_id,
            action="UPDATE_TENANT",
            details={"before": old_values, "after": update_data}
        )
        
        db.commit()
        db.refresh(tenant)
        return tenant, None

    @staticmethod
    def log_action(db: Session, actor_id: int, action: str, tenant_id: str = None, details: dict = None):
        audit = AuditLogModel(
            id=str(uuid.uuid4()),
            actor_id=actor_id,
            tenant_id=tenant_id,
            action=action,
            details=details or {},
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        # No hacemos commit aquí, dejamos que el método llamador lo haga con el resto de la transacción
