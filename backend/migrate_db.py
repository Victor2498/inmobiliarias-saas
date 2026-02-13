import os
import sys
from sqlalchemy import create_engine, text

# Agregar path para imports
sys.path.append(os.path.join(os.getcwd(), 'app'))
from app.core.config import settings

def migrate():
    print("🛠️ Ejecutando migración manual: ADD login_count...")
    engine = create_engine(settings.get_database_url)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;"))
            conn.commit()
            print("✅ Columna login_count añadida correctamente.")
        except Exception as e:
            print(f"❌ Error en migración: {e}")

if __name__ == "__main__":
    migrate()
