import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Forzar carga de .env desde la carpeta backend
base_path = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_path, '.env')
load_dotenv(env_path)

print(f"📁 Buscando .env en: {env_path}")
print(f"🔍 Existe .env? {os.path.exists(env_path)}")

email_env = os.getenv("INITIAL_SUPERADMIN_EMAIL")
print(f"📧 INITIAL_SUPERADMIN_EMAIL en .env: {email_env}")

# Conexión a DB
db_url = os.getenv("DATABASE_URL")
if db_url:
    # Limpiar pgbouncer params para el engine
    clean_url = db_url.split("?")[0].replace("postgres://", "postgresql://")
    print(f"🔗 Conectando a DB: {clean_url[:40]}...")
    
    engine = create_engine(clean_url)
    with engine.connect() as conn:
        print("📝 Usuarios actuales en DB:")
        res = conn.execute(text("SELECT email, username, role FROM users"))
        found = False
        for r in res:
            print(f"   - {r}")
            found = True
        if not found:
            print("   (Vacío)")

        # Reparación forzada si el email no coincide
        target_email = "victoralfredo27@gmail.com"
        if email_env != target_email:
            print(f"⚠️ ATENCIÓN: El .env tiene '{email_env}' pero se esperaba '{target_email}'.")
        
        print("🛠️ Ejecutando limpieza final de remanentes...")
        conn.execute(text("DELETE FROM users WHERE email = 'alfredsistemas85@gmail.com' OR (role = 'SUPERADMIN' AND email != :target)"), {"target": target_email})
        conn.commit()
else:
    print("❌ No se encontró DATABASE_URL en el entorno.")
