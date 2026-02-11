from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.security import hashing, tokens
from app.infrastructure.persistence.models import UserModel

router = APIRouter()

from app.infrastructure.persistence.models import UserModel, TenantModel
from app.api.v1.schemas import TenantLogin, UserLogin

router = APIRouter()

@router.post("/login/tenant")
def login_tenant(data: TenantLogin, db: Session = Depends(get_db)):
    tenant = db.query(TenantModel).filter(TenantModel.name == data.nombre_inmobiliaria).first()
    if not tenant or not hashing.verify_password(data.password, tenant.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de inmobiliaria o contraseña incorrectos",
        )
    
    if not tenant.is_active:
        raise HTTPException(status_code=403, detail="Inmobiliaria inactiva")

    access_token = tokens.create_access_token(
        subject=tenant.email,
        tenant_id=tenant.id,
        role="INMOBILIARIA"
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": tenant.name,
            "email": tenant.email,
            "role": "INMOBILIARIA",
            "tenant_id": tenant.id,
            "preferences": tenant.preferences
        }
    }

@router.post("/login/admin")
def login_admin(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == data.email).first()
    if not user or not hashing.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    
    if user.role != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    access_token = tokens.create_access_token(
        subject=user.email,
        tenant_id=user.tenant_id,
        role=user.role
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id
        }
    }
