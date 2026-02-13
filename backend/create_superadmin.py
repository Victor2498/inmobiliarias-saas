import sys
import os
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.domain.models.user import UserModel
from app.domain.models.tenant import TenantModel
from app.infrastructure.security.hashing import get_password_hash

def create_superadmin():
    print("🚀 Iniciando configuración de SuperAdmin...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Asegurar Tenant Maestro
        master_tenant = db.query(TenantModel).filter(TenantModel.id == "master").first()
        if not master_tenant:
            print("📦 Creando Tenant Maestro...")
            master_tenant = TenantModel(
                id="master",
                name="SaaS Admin System",
                plan_id="premium",
                is_active=True
            )
            db.add(master_tenant)
            db.commit()
        
        # 2. Configuración SuperAdmin
        email = "victoralfredo27@gmail.com"
        username = "superadmin"
        password = "admin123456"
        
        # Limpieza de conflictos: Eliminar cualquier usuario que use este email o este username
        conflicts = db.query(UserModel).filter(or_(UserModel.email == email, UserModel.username == username)).all()
        for c in conflicts:
            print(f"🗑️ Eliminando usuario conflictivo: {c.email} / {c.username}")
            db.delete(c)
        db.commit()

        print(f"👤 Creando SuperAdmin final: {email} / {username}...")
        admin_user = UserModel(
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
        db.add(admin_user)
        db.commit()
        
        print(f"✅ Configuración completada con éxito.")
        print(f"📧 Acceso Email: {email}")
        print(f"👤 Acceso Usuario: {username}")
        print(f"🔑 Password: {password}")
            
    except Exception as e:
        print(f"❌ Error crítico: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
