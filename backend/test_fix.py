import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.application.services.admin_service import AdminService
from app.core.database import SessionLocal

def test_fix():
    db = SessionLocal()
    
    email_to_check = "victoralfredo2498@gmail.com"
    name_to_check = "Inmobiliaria UNNE"
    
    print(f"--- Testing creation with conflicting email: {email_to_check} ---", flush=True)
    tenant, error = AdminService.create_tenant(
        db,
        name=name_to_check + " 2", # Different name to avoid name conflict
        email=email_to_check,
        password="testpassword123",
        plan="lite",
        whatsapp_enabled=False,
        actor_id=1
    )
    
    if error:
        print(f"EXPECTED ERROR CAUGHT: {error}", flush=True)
    else:
        print(f"ERROR: Tenant created successfully with ID {tenant.id}, but it should have failed!", flush=True)
        
    db.close()

if __name__ == "__main__":
    test_fix()
