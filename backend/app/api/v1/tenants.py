import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.application.services.tenant_service import TenantService
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)
router = APIRouter()

class TenantCreate(BaseModel):
    name: str
    admin_email: EmailStr
    admin_password: str
    admin_full_name: str

@router.post("/register")
def register_tenant(tenant_in: TenantCreate, db: Session = Depends(get_db)):
    service = TenantService(db)
    return service.register_tenant(
        name=tenant_in.name,
        admin_email=tenant_in.admin_email,
        admin_password=tenant_in.admin_password,
        admin_full_name=tenant_in.admin_full_name
    )


class TenantUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    plan: str | None = None
    whatsapp_enabled: bool | None = None

@router.put("/{tenant_id}")
def update_tenant(
    tenant_id: str,
    tenant_in: TenantUpdate,
    db: Session = Depends(get_db)
):
    service = TenantService(db)
    return service.update_tenant(tenant_id, tenant_in.dict(exclude_unset=True))

@router.post("/{tenant_id}/toggle-status")
def toggle_tenant_status(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    service = TenantService(db)
    return service.toggle_tenant_status(tenant_id)

@router.delete("/{tenant_id}")
def delete_tenant(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    service = TenantService(db)
    return service.delete_tenant(tenant_id)
