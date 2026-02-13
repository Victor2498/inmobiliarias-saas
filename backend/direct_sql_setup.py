import os
import sys
from sqlalchemy import create_engine, text

# Agregar path
sys.path.append(os.path.join(os.getcwd(), 'app'))
from app.core.config import settings
from app.infrastructure.security.hashing import get_password_hash

def force_sql_setup():
    print("🛠️ Ejecutando SQL DIRECTO para SuperAdmin...")
    engine = create_engine(settings.get_database_url)
    
    email = "victoralfredo27@gmail.com"
    username = "superadmin"
    password_hash = get_password_hash("admin123456")
    
    with engine.connect() as conn:
        try:
            # 1. Asegurar campos
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR;"))
            
            # 2. Limpieza
            conn.execute(text("DELETE FROM users WHERE email = 'alfredsistemas85@gmail.com' OR username = 'superadmin' OR role = 'SUPERADMIN';"))
            
            # 3. Insertar
            query = text("""
                INSERT INTO users (tenant_id, email, username, hashed_password, full_name, role, is_active, email_verified, is_system_account, cannot_be_deleted, login_count, created_at, updated_at)
                VALUES ('master', :email, :username, :hash, 'Sistema SuperAdmin', 'SUPERADMIN', true, true, true, true, 0, now(), now())
            """)
            conn.execute(query, {"email": email, "username": username, "hash": password_hash})
            conn.commit()
            print("✅ SuperAdmin reestablecido con éxito via SQL.")
        except Exception as e:
            print(f"❌ Error en SQL: {e}")

if __name__ == "__main__":
    force_sql_setup()
