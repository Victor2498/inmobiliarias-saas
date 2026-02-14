import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.domain.models.user import UserModel
from app.domain.models.tenant import TenantModel

def deep_check():
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    email = "victoralfredo2498@gmail.com"
    user = db.query(UserModel).filter(UserModel.email == email).first()
    
    if user:
        print(f"--- USER FOUND ---")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"TenantID: {user.tenant_id}")
        
        tenant = db.query(TenantModel).filter(TenantModel.id == user.tenant_id).first()
        if tenant:
            print(f"Tenant Found: ID={tenant.id}, Name={tenant.name}")
        else:
            print(f"ORPHANED USER: No tenant found with ID {user.tenant_id}")
            
    else:
        print("User not found.")
        
    db.close()

if __name__ == "__main__":
    deep_check()
