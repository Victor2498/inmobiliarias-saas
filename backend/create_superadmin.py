import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.domain.models.user import UserModel
from app.domain.models.tenant import TenantModel
from app.infrastructure.security.hashing import get_password_hash

def create_superadmin():
    print("🚀 Creando usuario SuperAdmin...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Crear Tenant Maestro si no existe
        master_tenant = db.query(TenantModel).filter(TenantModel.id == "master").first()
        if not master_tenant:
            print("📦 Creando Tenant Maestro...")
            master_tenant = TenantModel(
                id="master",
                name="Sistema Inmobiliario Enterprise",
                slug="sistema",
                plan_id="premium",
                is_active=True
            )
            db.add(master_tenant)
            db.commit()
            db.refresh(master_tenant)
        
        # 2. Crear SuperAdmin si no existe
        email = "superadmin@inmonea.com"
        password = "admin123456"
        
        admin_user = db.query(UserModel).filter(UserModel.email == email).first()
        if not admin_user:
            print(f"👤 Creando usuario {email}...")
            admin_user = UserModel(
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Sistema SuperAdmin",
                role="SUPERADMIN",
                tenant_id="master",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Usuario creado con éxito.")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
        else:
            print(f"ℹ️ El usuario {email} ya existe.")
            
    except Exception as e:
        print(f"❌ Error al crear superadmin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
