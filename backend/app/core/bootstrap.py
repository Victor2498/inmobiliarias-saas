import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.infrastructure.persistence.models import UserModel, TenantModel
from app.infrastructure.security.hashing import get_password_hash
from app.core.config import settings

logger = logging.getLogger(__name__)

def bootstrap_system():
    """
    Crea el SuperAdmin y el Tenant maestro si no existen.
    Basado en el SPEC de Seguridad Avanzada.
    """
    db = SessionLocal()
    try:
        # 1. Asegurar Tenant Maestro
        master_tenant = db.query(TenantModel).filter(TenantModel.id == "master").first()
        if not master_tenant:
            logger.info("📦 Creando Tenant Maestro (Bootstrap)...")
            master_tenant = TenantModel(
                id="master",
                name="SaaS Admin System",
                email="admin@inmonea.com",
                hashed_password=get_password_hash(settings.INITIAL_SUPERADMIN_PASSWORD),
                plan="premium",
                is_active=True
            )
            db.add(master_tenant)
            db.commit()
            db.refresh(master_tenant)

        # 2. Asegurar SuperAdmin
        email = "superadmin@inmonea.com"
        username = "superadmin"
        
        admin_user = db.query(UserModel).filter(UserModel.email == email).first()
        if not admin_user:
            logger.info(f"👤 Creando SuperAdmin: {email} (Bootstrap)...")
            admin_user = UserModel(
                email=email,
                username=username,
                hashed_password=get_password_hash(settings.INITIAL_SUPERADMIN_PASSWORD),
                full_name="Sistema SuperAdmin",
                role="SUPERADMIN",
                tenant_id="master",
                is_active=True,
                email_verified=True,
                is_system_account=True,
                cannot_be_deleted=True,
                force_password_change=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("✅ SuperAdmin creado con éxito.")
        else:
            # Asegurar que tenga los flags correctos si ya existe
            if not admin_user.is_system_account:
                admin_user.is_system_account = True
                admin_user.cannot_be_deleted = True
                admin_user.username = username
                db.commit()
                logger.info("⚠️ Flags de SuperAdmin actualizados.")

    except Exception as e:
        logger.error(f"❌ Error en bootstrap: {e}")
        db.rollback()
    finally:
        db.close()
