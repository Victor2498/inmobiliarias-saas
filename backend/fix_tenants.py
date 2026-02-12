from app.core.database import SessionLocal
from app.domain.models.tenant import TenantModel
from app.domain.models.user import UserModel
from app.infrastructure.security import hashing
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_tenants():
    db = SessionLocal()
    try:
        tenants = db.query(TenantModel).all()
        logger.info(f"Analizando {len(tenants)} inmobiliarias...")
        
        for t in tenants:
            # Buscar si ya tiene un usuario administrador
            user = db.query(UserModel).filter(UserModel.tenant_id == t.id).first()
            
            if not user:
                logger.info(f"🔧 Reparando inmobiliaria: {t.name} (ID: {t.id})")
                # Crear el usuario administrador usando los datos del tenant
                # Usamos el hashed_password que ya tiene el tenant (si fue creado por AdminService)
                new_admin = UserModel(
                    tenant_id=t.id,
                    email=t.email,
                    hashed_password=t.hashed_password,
                    full_name=f"Admin {t.name}",
                    role="INMOBILIARIA_ADMIN",
                    is_active=True,
                    email_verified=True
                )
                db.add(new_admin)
                logger.info(f"✅ Usuario {t.email} creado y vinculado.")
        
        db.commit()
        logger.info("🚀 Sincronización completada con éxito.")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error durante la sincronización: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_tenants()
