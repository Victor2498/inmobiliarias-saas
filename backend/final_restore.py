import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Forzar path
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.infrastructure.security.hashing import get_password_hash

def final_restore():
    print("🚀 Restauración ATÓMICA de SuperAdmin...")
    engine = create_engine(settings.get_database_url)
    
    email = "victoralfredo27@gmail.com"
    username = "superadmin"
    password_hash = get_password_hash("admin123456")
    
    with engine.connect() as conn:
        try:
            # 1. Limpieza de cualquier rastro
            conn.execute(text("DELETE FROM users WHERE role = 'SUPERADMIN' OR email = :e OR username = :u"), {"e": email, "u": username})
            
            # 2. Asegurar Tenant Maestro (Si no existe, se crea con SQL para evitar fallos de modelo)
            res = conn.execute(text("SELECT id FROM tenants WHERE id = 'master'"))
            if not res.fetchone():
                print("📦 Creando Tenant Maestro (SQL)...")
                conn.execute(text("""
                    INSERT INTO tenants (id, name, email, hashed_password, plan, is_active, created_at, updated_at)
                    VALUES ('master', 'Inmonea Global', :e, :h, 'premium', true, now(), now())
                """), {"e": email, "h": password_hash})
            
            # 3. Insertar SuperAdmin
            print(f"👤 Insertando SuperAdmin: {email}...")
            conn.execute(text("""
                INSERT INTO users (tenant_id, email, username, hashed_password, full_name, role, is_active, email_verified, is_system_account, cannot_be_deleted, login_count, created_at, updated_at)
                VALUES ('master', :e, :u, :h, 'Sistema SuperAdmin', 'SUPERADMIN', true, true, true, true, 0, now(), now())
            """), {"e": email, "u": username, "h": password_hash})
            
            conn.commit()
            print("✅ RESTAURACIÓN COMPLETADA.")
            
            # 4. Verificar
            res = conn.execute(text("SELECT email, username FROM users WHERE role = 'SUPERADMIN'"))
            print(f"👀 Verificación final: {res.fetchone()}")
            
        except Exception as e:
            print(f"❌ Error en restauración: {e}")
            conn.rollback()

if __name__ == "__main__":
    final_restore()
