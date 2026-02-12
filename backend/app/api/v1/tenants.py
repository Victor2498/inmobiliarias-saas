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

