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
    
    # Parches para 'contracts'
    contract_patches = [
        ("current_rent", "FLOAT", "monthly_rent"), # Usamos monthly_rent como default
    ]
    
    with engine.connect() as conn:
        # Procesar 'tenants'
        for col_name, col_type, default in tenant_patches:
            try:
                check_query = text(f"SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = '{col_name}'")
                if conn.execute(check_query).scalar() == 0:
                    print(f"➕ Agregando columna '{col_name}' a 'tenants'...")
                    conn.execute(text(f"ALTER TABLE tenants ADD COLUMN {col_name} {col_type} DEFAULT {default}"))
                    conn.commit()
            except Exception as e:
                print(f"❌ Error en 'tenants.{col_name}': {e}")

        # Procesar 'contracts'
        for col_name, col_type, default in contract_patches:
            try:
                check_query = text(f"SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = '{col_name}'")
                if conn.execute(check_query).scalar() == 0:
                    print(f"➕ Agregando columna '{col_name}' a 'contracts'...")
                    # Para current_rent, si la columna 'monthly_rent' existe, podemos usarla como default inicial
                    conn.execute(text(f"ALTER TABLE contracts ADD COLUMN {col_name} {col_type}"))
                    conn.execute(text(f"UPDATE contracts SET {col_name} = monthly_rent WHERE {col_name} IS NULL"))
                    conn.commit()
            except Exception as e:
                print(f"❌ Error en 'contracts.{col_name}': {e}")
                
        print("\n✨ Sincronización completada.")

if __name__ == "__main__":
    patch_database()
