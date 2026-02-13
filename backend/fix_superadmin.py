import sys
import os
from sqlalchemy import create_engine, or_, text
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.domain.models.user import UserModel
from app.domain.models.tenant import TenantModel
# Importar otros modelos para evitar errores de mapeo de SQLAlchemy
import app.domain.models.business
import app.domain.models.whatsapp
from app.infrastructure.security.hashing import get_password_hash

def fix_superadmin():
    print("🛠️ Iniciando REPARACIÓN CRÍTICA del SuperAdmin...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        email = "victoralfredo27@gmail.com"
        username = "superadmin"
        password = "admin123456"

        print(f"🔍 Buscando conflictos para {email} / {username}...")
        
        # 1. Limpieza total de posibles duplicados
        # Buscamos por email viejo, email nuevo, username viejo (admin), username nuevo
        db.execute(text("DELETE FROM users WHERE email = 'alfredsistemas85@gmail.com' OR username = 'superadmin' OR role = 'SUPERADMIN'"))
        db.commit()
        print("🗑️ Registros conflictivos eliminados.")

        # 2. Asegurar Tenant Maestro
        master_tenant = db.query(TenantModel).filter(TenantModel.id == "master").first()
        if not master_tenant:
            print("📦 Creando Tenant Maestro...")
            master_tenant = TenantModel(
                id="master",
                name="SaaS Admin System",
                plan="premium",
                is_active=True
            )
            db.add(master_tenant)
            db.commit()

        # 3. Crear SuperAdmin Real
        print(f"👤 Creando SuperAdmin: {email}...")
        new_admin = UserModel(
            email=email,
            username=username,
            hashed_password=get_password_hash(password),
            full_name="Sistema SuperAdmin",
            role="SUPERADMIN",
            tenant_id="master",
            is_active=True,
            email_verified=True,
            is_system_account=True,
            cannot_be_deleted=True
        )
        db.add(new_admin)
        db.commit()
        
        print("✅ REPARACIÓN EXITOSA.")
        print(f"📧 Identificación: {email} o {username}")
        print(f"🔑 Password: {password}")

    except Exception as e:
        print(f"❌ Error durante la reparación: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_superadmin()
