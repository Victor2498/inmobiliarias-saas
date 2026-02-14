import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.domain.models.user import UserModel
from app.domain.models.tenant import TenantModel

def check_conflicts():
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    # 1. Check by Name (Inmobiliaria UNNE)
    name = "Inmobiliaria UNNE"
    tenant = db.query(TenantModel).filter(TenantModel.name == name).first()
    print(f"Tenant by name '{name}': {'FOUND ID=' + tenant.id if tenant else 'NOT FOUND'}")
    
    # 2. Check by Email (victoralfredo2498@gmail.com)
    email = "victoralfredo2498@gmail.com"
    user_by_email = db.query(UserModel).filter(UserModel.email == email).first()
    print(f"User by email '{email}': {'FOUND ID=' + str(user_by_email.id) + ' Username=' + user_by_email.username if user_by_email else 'NOT FOUND'}")
    
    # 3. Check by Username (inmobiliaria_unne)
    username = name.strip().lower().replace(" ", "_").replace(".", "_")
    user_by_username = db.query(UserModel).filter(UserModel.username == username).first()
    print(f"User by username '{username}': {'FOUND ID=' + str(user_by_username.id) + ' Email=' + user_by_username.email if user_by_username else 'NOT FOUND'}")
    
    db.close()

if __name__ == "__main__":
    check_conflicts()
