from app.core.database import SessionLocal
from app.infrastructure.persistence.models import UserModel, TenantModel
from app.infrastructure.security import hashing
import uuid

def bootstrap():
    db = SessionLocal()
    try:
        # 1. Crear Tenant Admin (ficticio para el SuperAdmin si es necesario, o solo el usuario)
        admin_tenant = db.query(TenantModel).filter(TenantModel.id == "admin").first()
        if not admin_tenant:
            admin_tenant = TenantModel(
                id="admin",
                name="Inmonea Admin",
                email="admin@inmonea.com",
                hashed_password=hashing.get_password_hash("admin123"),
                is_active=True,
                preferences={"theme": "dark"}
            )
            db.add(admin_tenant)
            print("✅ Tenant Admin creado")

        # 2. Crear SuperAdmin User
        superadmin = db.query(UserModel).filter(UserModel.email == "admin@inmonea.com").first()
        if not superadmin:
            superadmin = UserModel(
                tenant_id="admin",
                email="admin@inmonea.com",
                hashed_password=hashing.get_password_hash("admin123"),
                full_name="Super Administrador",
                role="SUPERADMIN",
                is_active=True
            )
            db.add(superadmin)
            print("✅ Usuario SuperAdmin creado")

        db.commit()
    except Exception as e:
        print(f"❌ Error bootstrapping: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    bootstrap()
