import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.infrastructure.security.hashing import get_password_hash

def reset_superadmin():
    print("🚀 Reseteando SuperAdmin...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        email = "superadmin@inmonea.com"
        new_password = "admin123456"
        hashed = get_password_hash(new_password)
        
        db.execute(
            text("UPDATE users SET hashed_password = :h WHERE email = :e"),
            {"h": hashed, "e": email}
        )
        db.commit()
        print(f"✅ Password de {email} reseteada a 'admin123456'")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_superadmin()
