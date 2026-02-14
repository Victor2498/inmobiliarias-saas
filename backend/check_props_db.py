import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

# Import all models to ensure SQLAlchemy mappers are initialized correctly
from app.domain.models import user, tenant, business, billing, whatsapp

from app.core.database import SessionLocal
from app.domain.models.user import UserModel
from app.domain.models.business import PropertyModel

def check_db():
    db = SessionLocal()
    try:
        u = db.query(UserModel).filter(UserModel.email == 'victor@gmail.com').first()
        if not u:
            print("USER 'victor@gmail.com' NOT FOUND")
            # Try by username if email check fails (though screenshot shows victor@gmail.com)
            u = db.query(UserModel).filter(UserModel.username == 'victor@gmail.com').first()
        
        if u:
            print(f"USER: ID={u.id}, Email={u.email}, TenantID={repr(u.tenant_id)}")
            all_props = db.query(PropertyModel).all()
            print(f"TOTAL PROPERTIES IN DB: {len(all_props)}")
            for p in all_props:
                print(f"PROPERTY ID={p.id}, Title={repr(p.title)}, TenantID={repr(p.tenant_id)}")
                print(f"MATCH: {p.tenant_id == u.tenant_id}")
        else:
            print("USER NOT FOUND")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
