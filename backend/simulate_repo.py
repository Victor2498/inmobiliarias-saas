import sys
import os
from sqlalchemy.orm import Session

# Add current directory to path
sys.path.append(os.getcwd())

from app.domain.models import user, tenant, business, billing, whatsapp
from app.core.database import SessionLocal
from app.domain.models.user import UserModel
from app.domain.models.business import PropertyModel
from app.infrastructure.security.tenant_context import set_current_tenant_id

def simulate_repo():
    db = SessionLocal()
    tenant_id = "1c4cbc36-9c91-4536" # User 20's tenant
    
    print(f"Setting context tenant_id: {tenant_id}")
    set_current_tenant_id(tenant_id)
    
    # Re-importing get_current_tenant_id to be sure
    from app.infrastructure.security.tenant_context import get_current_tenant_id
    current_tid = get_current_tenant_id()
    print(f"Verified context tenant_id: {current_tid}")
    
    print("\n--- QUERY SIMULATION ---")
    query = db.query(PropertyModel).filter(PropertyModel.tenant_id == current_tid)
    results = query.all()
    print(f"Query results count: {len(results)}")
    for p in results:
        print(f"- ID: {p.id}, Title: {p.title}, Tenant: {p.tenant_id}")
        
    db.close()

if __name__ == "__main__":
    simulate_repo()
