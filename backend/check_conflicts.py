import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from app.core.config import settings
    from app.domain.models.user import UserModel
    from app.domain.models.tenant import TenantModel
except ImportError as e:
    print(f"Import Error: {e}", flush=True)
    sys.exit(1)

def check_db():
    print("Starting DB check...", flush=True)
    try:
        url = settings.get_database_url
        print(f"Connecting to {url.split('@')[-1]}", flush=True) # Hide password
        engine = create_engine(url)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        email_to_check = "victoralfredo2498@gmail.com"
        name_to_check = "Inmobiliaria UNNE"
        
        print(f"--- Checking for email: {email_to_check} ---", flush=True)
        user = db.query(UserModel).filter(UserModel.email == email_to_check).first()
        if user:
            print(f"USER_FOUND|{user.id}|{user.username}|{user.tenant_id}", flush=True)
        else:
            print("USER_NOT_FOUND", flush=True)
            
        print(f"\n--- Checking for tenant name: {name_to_check} ---", flush=True)
        tenant = db.query(TenantModel).filter(TenantModel.name == name_to_check).first()
        if tenant:
            print(f"TENANT_FOUND|{tenant.id}|{tenant.email}", flush=True)
        else:
            print("TENANT_NOT_FOUND", flush=True)
            
        # Check all users with that email pattern
        print("\n--- All users with similar emails ---", flush=True)
        users = db.query(UserModel).filter(UserModel.email.contains("victoralfredo")).all()
        for u in users:
            print(f"LIST|{u.email}|{u.username}", flush=True)
            
        db.close()
    except Exception as e:
        print(f"CRITICAL_ERROR: {e}", flush=True)

if __name__ == "__main__":
    check_db()
