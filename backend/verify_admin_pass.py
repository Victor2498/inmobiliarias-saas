import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.infrastructure.security.hashing import verify_password

def verify_superadmin():
    print("🚀 Verificando hash del SuperAdmin...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        user = db.execute(text("SELECT email, hashed_password FROM users WHERE email = 'superadmin@inmonea.com'")).first()
        if not user:
            print("❌ SuperAdmin no encontrado.")
            return

        password_to_check = "admin123456"
        is_correct = verify_password(password_to_check, user.hashed_password)
        
        print(f"📧 Usuario: {user.email}")
        print(f"🔑 Password 'admin123456' es: {'✅ CORRECTA' if is_correct else '❌ INCORRECTA'}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_superadmin()
