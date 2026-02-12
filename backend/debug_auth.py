import sys
import os
from sqlalchemy import text
from fastapi.testclient import TestClient

# Path setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.api.deps import get_db
from app.infrastructure.persistence.models import UserModel
from app.core.config import settings
from app.infrastructure.security.hashing import verify_password, get_password_hash

def debug_auth():
    print("🕵️‍♂️ Iniciando Debug de Autenticación...")
    
    # 1. Verificar DB Directamente
    db = next(get_db())
    try:
        user = db.query(UserModel).filter(UserModel.email == settings.INITIAL_SUPERADMIN_EMAIL).first()
        
        if not user:
            print(f"❌ usuario {settings.INITIAL_SUPERADMIN_EMAIL} NO ENCONTRADO en DB.")
            # Intentar listar todos los usuarios
            users = db.query(UserModel).all()
            print(f"ℹ️ Usuarios existentes: {[u.email for u in users]}")
            return

        print(f"✅ Usuario encontrado: {user.email} (ID: {user.id})")
        print(f"🔑 Hash almacenado: {user.hashed_password[:10]}...")
        
        # 2. Verificar Password
        pwd = settings.INITIAL_SUPERADMIN_PASSWORD
        print(f"🔑 Contraseña a probar: {pwd}")
        
        is_valid = verify_password(pwd, user.hashed_password)
        if is_valid:
            print("✅ verify_password: OK")
        else:
            print("❌ verify_password: FALLÓ")
            print("   Intentando generar nuevo hash...")
            new_hash = get_password_hash(pwd)
            print(f"   Nuevo hash: {new_hash[:10]}...")
            if verify_password(pwd, new_hash):
                print("   ✅ El hashing funciona para nuevos hashes.")
            else:
                print("   ❌ El hashing ESTÁ ROTO.")

        # 3. Probar Endpoint Login
        client = TestClient(app)
        print("\n📡 Probando Endpoint /login...")
        response = client.post("/api/v1/auth/login", data={
            "username": settings.INITIAL_SUPERADMIN_EMAIL,
            "password": pwd
        })
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Excepción: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_auth()
