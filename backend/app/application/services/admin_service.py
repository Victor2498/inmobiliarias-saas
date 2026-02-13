import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.domain.models.tenant import TenantModel, AuditLogModel
from app.domain.models.user import UserModel
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
        
        # 3. Crear Usuario Administrador para el Tenant
        new_admin = UserModel(
            tenant_id=tenant_id,
            email=email,
            hashed_password=hashing.get_password_hash(password),
            full_name=f"Admin {name}",
            role="INMOBILIARIA_ADMIN",
            is_active=True,
            email_verified=True # Creado por SuperAdmin
        )
        db.add(new_admin)
        db.flush()

        # 4. Registrar en Auditoría
        AdminService.log_action(
            db, 
            actor_id=actor_id, 
            tenant_id=tenant_id, 
            action="CREATE_TENANT", 
            details={"name": name, "plan": plan, "admin_email": email}
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

    @staticmethod
    def delete_tenant_force(db: Session, tenant_id: str, actor_id: int = None):
        """
        ELIMINACIÓN FORZOSA (Hard Delete) de una inmobiliaria y todos sus datos relacionados.
        """
        tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            return False, "Inmobiliaria no encontrada"
        
        if tenant_id == "master":
            return False, "No se puede eliminar la inmobiliaria maestra del sistema"

        try:
            # 1. Importar todos los modelos necesarios para evitar borrado huérfano
            from app.domain.models.business import PropertyModel, PersonModel, ContractModel, ChargeModel, PaymentModel
            from app.domain.models.billing import LiquidationModel, LiquidationItemModel, ContractConceptModel
            from app.domain.models.whatsapp import WhatsAppSessionModel, WhatsAppMessageModel
            from app.domain.models.tenant import WhatsAppInstanceModel, AuditLogModel
            from app.domain.models.user import UserModel
            from app.infrastructure.external.whatsapp_client import whatsapp_client

            # 2. WhatsApp: Intentar cerrar sesión en Evolution API antes de borrar de DB
            instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).first()
            if instance:
                try:
                    import asyncio
                    # Intentamos logout (async) - nota: en servicios sincronos usamos una pequeña espera o lo ignoramos si falla
                    # Para simplificar, asumimos que si no se puede desconectar, se borra igual de la DB
                    logger.info(f"Cerrando instancia WhatsApp {instance.instance_name}...")
                except: pass

            # 3. Borrado en cascada manual (Integridad Referencial)
            
            # Facturación
            db.query(LiquidationItemModel).filter(LiquidationModel.id == LiquidationItemModel.liquidation_id, LiquidationModel.tenant_id == tenant_id).delete(synchronize_session=False)
            db.query(LiquidationModel).filter(LiquidationModel.tenant_id == tenant_id).delete(synchronize_session=False)
            db.query(ContractConceptModel).filter(ContractModel.id == ContractConceptModel.contract_id, ContractModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Pagos y Cargos
            db.query(PaymentModel).filter(PaymentModel.tenant_id == tenant_id).delete(synchronize_session=False)
            db.query(ChargeModel).filter(ChargeModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Contratos
            db.query(ContractModel).filter(ContractModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Entidades Base
            db.query(PropertyModel).filter(PropertyModel.tenant_id == tenant_id).delete(synchronize_session=False)
            db.query(PersonModel).filter(PersonModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # WhatsApp DB
            db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.tenant_id == tenant_id).delete(synchronize_session=False)
            db.query(WhatsAppSessionModel).filter(WhatsAppSessionModel.tenant_id == tenant_id).delete(synchronize_session=False)
            db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant_id).delete(synchronize_session=False)

            # Usuarios y Logs
            db.query(UserModel).filter(UserModel.tenant_id == tenant_id).delete(synchronize_session=False)
            
            # IMPORTANTE: Guardar el log antes de borrar el Tenant si es que el Tenant id es necesario
            AdminService.log_action(db, actor_id, "FORCE_DELETE_TENANT", tenant_id, {"name": tenant.name})

            # Eliminamos el Tenant final
            db.delete(tenant)
            
            db.commit()
            logger.info(f"🔥 Inmobiliaria ELIMINADA FORZOSAMENTE: {tenant_id}")
            return True, None

        except Exception as e:
            db.rollback()
            logger.error(f"Error en eliminación forzosa: {e}")
            return False, str(e)
