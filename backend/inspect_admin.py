import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings

def inspect_superadmin():
    print("🚀 Inspeccionando SuperAdmin en DB...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        user = db.execute(text("SELECT email, hashed_password FROM users WHERE email = 'superadmin@inmonea.com'")).first()
        if not user:
            print("❌ SuperAdmin no encontrado.")
            return

        print(f"📧 Usuario: {user.email}")
        print(f"🔒 Hash: {user.hashed_password}")
        print(f"📏 Longitud del Hash: {len(user.hashed_password)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_superadmin()
