import sys
import os
from sqlalchemy import create_engine, text

# Asegurar que el path incluya la carpeta app
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings

def patch_database():
    print("🛠️ Iniciando el parche de base de datos...")
    
    engine = create_engine(settings.get_database_url)
    
    # Lista de columnas que sospechamos faltan en 'tenants'
    tenant_patches = [
        ("email", "VARCHAR", "''"),
        ("hashed_password", "VARCHAR", "''"),
        ("plan", "VARCHAR", "'lite'"),
        ("whatsapp_enabled", "BOOLEAN", "FALSE"),
        ("preferences", "JSON", "'{\"theme\": \"light\"}'"),
    ]
    
    with engine.connect() as conn:
        for col_name, col_type, default in tenant_patches:
            try:
                # Verificar si la columna existe
                check_query = text(f"""
                    SELECT COUNT(*) 
                    FROM information_schema.columns 
                    WHERE table_name = 'tenants' AND column_name = '{col_name}'
                """)
                exists = conn.execute(check_query).scalar()
                
                if exists == 0:
                    print(f"➕ Agregando columna '{col_name}' a 'tenants'...")
                    alter_query = text(f"ALTER TABLE tenants ADD COLUMN {col_name} {col_type} DEFAULT {default}")
                    conn.execute(alter_query)
                    conn.commit()
                    print(f"✅ Columna '{col_name}' agregada.")
                else:
                    print(f"ℹ️ La columna '{col_name}' ya existe.")
                    
            except Exception as e:
                print(f"❌ Error al procesar columna '{col_name}': {e}")
                
        print("\n✨ Sincronización completada.")

if __name__ == "__main__":
    patch_database()
