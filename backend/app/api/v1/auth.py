import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.security import hashing, tokens
from app.infrastructure.persistence.models import UserModel, TenantModel
from app.api.v1.schemas import TenantLogin, UserLogin

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/login/tenant")
def login_tenant(data: TenantLogin, db: Session = Depends(get_db)):
    logger.info(f"Attempting tenant login for: {data.nombre_inmobiliaria}")
    tenant = db.query(TenantModel).filter(TenantModel.name == data.nombre_inmobiliaria).first()
    if not tenant:
        logger.warning(f"Tenant not found: {data.nombre_inmobiliaria}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de inmobiliaria o contrasena incorrectos",
        )
    
    if not hashing.verify_password(data.password, tenant.hashed_password):
        logger.warning(f"Invalid password for tenant: {data.nombre_inmobiliaria}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de inmobiliaria o contrasena incorrectos",
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
            "plan": tenant.plan,
            "whatsapp_enabled": tenant.whatsapp_enabled,
            "preferences": tenant.preferences
        }
    }

@router.post("/login/admin")
def login_admin(data: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Attempting admin login for: {data.email}")
    user = db.query(UserModel).filter(UserModel.email == data.email).first()
    if not user:
        logger.warning(f"Admin user not found: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos",
        )
    
    if not hashing.verify_password(data.password, user.hashed_password):
        logger.warning(f"Invalid password for admin: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos",
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
