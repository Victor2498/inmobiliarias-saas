import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

# Import all models to ensure SQLAlchemy mappers are initialized correctly
from app.domain.models import user, tenant, business, billing, whatsapp

from app.core.database import SessionLocal
from app.domain.models.user import UserModel
from app.domain.models.business import PropertyModel
from app.domain.models.tenant import TenantModel

def check_db():
    db = SessionLocal()
    try:
        print("--- USERS ---")
        users = db.query(UserModel).all()
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, TenantID: {u.tenant_id}")
            
        print("\n--- TENANTS ---")
        tenants = db.query(TenantModel).all()
        for t in tenants:
            print(f"ID: {t.id}, Name: {t.name}")
            
        print("\n--- PROPERTIES ---")
        props = db.query(PropertyModel).all()
        for p in props:
            print(f"ID: {p.id}, Title: {p.title}, TenantID: {p.tenant_id}")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
