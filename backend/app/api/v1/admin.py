from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.infrastructure.persistence.models import TenantModel
from app.api.v1.schemas import TenantCreate, TenantUpdate
from app.infrastructure.security import hashing
import uuid

from app.api.deps import RoleChecker

router = APIRouter()
admin_only = RoleChecker(["SUPERADMIN"])

@router.post("/", response_model=Dict[str, Any])
def create_tenant(tenant: TenantCreate, db: Session = Depends(get_db), _ = Depends(admin_only)):
    # Verificar si el nombre ya existe
    existing = db.query(TenantModel).filter(TenantModel.name == tenant.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="El nombre de la inmobiliaria ya existe")
    
    new_tenant = TenantModel(
        id=str(uuid.uuid4()),
        name=tenant.name,
        email=tenant.email,
        hashed_password=hashing.get_password_hash(tenant.password),
        is_active=True,
        plan=tenant.plan,
        whatsapp_enabled=tenant.whatsapp_enabled,
        preferences={"theme": "light"}
    )
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    return {"message": "Inmobiliaria creada con exito", "id": new_tenant.id}

@router.get("/", response_model=List[Dict[str, Any]])
def list_tenants(db: Session = Depends(get_db), _ = Depends(admin_only)):
    tenants = db.query(TenantModel).all()
    return tenants

@router.patch("/{tenant_id}")
def update_tenant(tenant_id: str, update_data: TenantUpdate, db: Session = Depends(get_db), _ = Depends(admin_only)):
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")
    
    if update_data.is_active is not None:
        tenant.is_active = update_data.is_active
    if update_data.plan is not None:
        tenant.plan = update_data.plan
    if update_data.whatsapp_enabled is not None:
        tenant.whatsapp_enabled = update_data.whatsapp_enabled
    if update_data.preferences is not None:
        # Merge de preferencias
        tenant.preferences = {**tenant.preferences, **update_data.preferences}
        
    db.commit()
    return {"message": "Inmobiliaria actualizada"}
