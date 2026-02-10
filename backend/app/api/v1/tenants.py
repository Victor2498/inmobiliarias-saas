from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.models import TenantModel, UserModel
from app.infrastructure.security import hashing
from pydantic import BaseModel, EmailStr
import uuid

router = APIRouter()

class TenantCreate(BaseModel):
    name: str
    admin_email: EmailStr
    admin_password: str
    admin_full_name: str

@router.post("/register")
def register_tenant(tenant_in: TenantCreate, db: Session = Depends(get_db)):
    # 1. Validar si ya existe el tenant o el usuario
    if db.query(TenantModel).filter(TenantModel.name == tenant_in.name).first():
        raise HTTPException(status_code=400, detail="Inmobiliaria ya registrada")
    
    if db.query(UserModel).filter(UserModel.email == tenant_in.admin_email).first():
        raise HTTPException(status_code=400, detail="Email de administrador ya en uso")

    # 2. Crear el Tenant
    tenant_id = str(uuid.uuid4())[:8]
    new_tenant = TenantModel(
        id=tenant_id,
        name=tenant_in.name,
        slug=tenant_in.name.lower().replace(" ", "-"),
        plan_id="lite"
    )
    db.add(new_tenant)
    
    # 3. Crear el Usuario Administrador de la Inmobiliaria
    new_admin = UserModel(
        tenant_id=tenant_id,
        email=tenant_in.admin_email,
        hashed_password=hashing.get_password_hash(tenant_in.admin_password),
        full_name=tenant_in.admin_full_name,
        role="INMOBILIARIA_ADMIN"
    )
    db.add(new_admin)
    
    db.commit()
    return {"message": "Inmobiliaria y administrador creados", "tenant_id": tenant_id}
