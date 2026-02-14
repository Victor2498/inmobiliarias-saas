import logging
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.domain.models.base import Base
from app.domain.models.tenant import TenantModel
from app.domain.models.user import UserModel
import app.domain.models.business
import app.domain.models.whatsapp
from app.infrastructure.security.hashing import get_password_hash
from app.core.config import settings

logger = logging.getLogger(__name__)

def bootstrap_system():
    """
    Sincroniza el esquema y asegura datos maestros (SuperAdmin/Tenant).
    """
    logger.info("🛠️ Iniciando sincronización de base de datos...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Esquema de base de datos sincronizado.")
    except Exception as e:
        logger.error(f"❌ Error al sincronizar esquema: {e}")

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
        email = settings.INITIAL_SUPERADMIN_EMAIL
        username = "superadmin"
        
        # Primero buscamos si existe un usuario con ese email (el nuevo)
        admin_user = db.query(UserModel).filter(UserModel.email == email).first()
        
        # Si no existe por email, buscamos por username 'superadmin' para renombrarlo
        if not admin_user:
            admin_user = db.query(UserModel).filter(UserModel.username == username).first()

        if not admin_user:
            logger.info(f"👤 Creando SuperAdmin Enterprise: {email} (Bootstrap)...")
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
            logger.info("✅ SuperAdmin Enterprise creado con éxito.")
        else:
            # Sincronización suave (Soft sync) - No sobrescribimos el password si ya existe
            logger.info(f"🔧 Sincronizando datos de SuperAdmin: {email}")
            admin_user.email = email
            admin_user.username = username
            admin_user.role = "SUPERADMIN"
            admin_user.tenant_id = "master"
            admin_user.email_verified = True
            admin_user.is_active = True
            db.commit()
            logger.info("✅ SuperAdmin sincronizado (sin afectar password).")

    except Exception as e:
        logger.error(f"❌ Error en bootstrap: {e}")
        db.rollback()
    finally:
        db.close()
