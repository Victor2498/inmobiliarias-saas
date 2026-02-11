import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings

def check_users():
    print("🚀 Verificando usuarios en la base de datos...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar tabla users
        result = db.execute(text("SELECT email, role, is_active FROM users")).fetchall()
        print(f"👥 Usuarios encontrados ({len(result)}):")
        for user in result:
            print(f"- {user.email} (Rol: {user.role}, Activo: {user.is_active})")
            
        # Verificar tabla tenants
        tenants = db.execute(text("SELECT id, name FROM tenants")).fetchall()
        print(f"\n🏢 Tenants encontrados ({len(tenants)}):")
        for tenant in tenants:
            print(f"- {tenant.id}: {tenant.name}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
