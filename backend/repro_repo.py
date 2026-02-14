import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.domain.models.business import PropertyModel
from app.infrastructure.persistence.repository import BaseRepository
from app.infrastructure.security.tenant_context import set_current_tenant_id, get_current_tenant_id

def test_repo_create():
    db = SessionLocal()
    repo = BaseRepository(PropertyModel, db)
    
    print(f"Current context tenant_id: {get_current_tenant_id()}")
    
    # 1. Test without context
    print("\n--- Testing without context ---")
    try:
        # We don't want to actually commit to DB if it's going to fail anyway
        # but create() does commit. Let's use a dummy dict.
        obj_in = {"title": "Test Property", "description": "Test", "price": 100.0, "address": "Test St"}
        tenant_id = get_current_tenant_id()
        if hasattr(PropertyModel, 'tenant_id') and "tenant_id" not in obj_in:
            obj_in["tenant_id"] = tenant_id
        print(f"Assigning tenant_id: {obj_in.get('tenant_id')}")
    except Exception as e:
        print(f"Error: {e}")
        
    # 2. Test with context
    print("\n--- Testing with context 'master' ---")
    set_current_tenant_id("master")
    print(f"Current context tenant_id: {get_current_tenant_id()}")
    obj_in = {"title": "Test Property", "description": "Test", "price": 100.0, "address": "Test St"}
    tenant_id = get_current_tenant_id()
    if hasattr(PropertyModel, 'tenant_id') and "tenant_id" not in obj_in:
        obj_in["tenant_id"] = tenant_id
    print(f"Assigning tenant_id: {obj_in.get('tenant_id')}")

    db.close()

if __name__ == "__main__":
    test_repo_create()
