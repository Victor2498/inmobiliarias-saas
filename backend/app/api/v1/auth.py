import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.security import hashing, tokens
from app.infrastructure.persistence.models import UserModel, TenantModel
from app.api.v1.schemas import TenantLogin, UserLogin

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/login/tenant")
def login_tenant(data: TenantLogin, db: Session = Depends(get_db)):
    # Segun SPEC: Login dual para inmobiliarias (email o username)
    # Buscamos en la tabla users al admin de esa inmobiliaria o usuario asociado
    user = db.query(UserModel).filter(
        or_(UserModel.email == data.nombre_inmobiliaria, UserModel.username == data.nombre_inmobiliaria)
    ).first()
    
    if not user:
        # Fallback para compatibilidad: buscar por nombre de tenant si el identifier no es email/user
        tenant = db.query(TenantModel).filter(TenantModel.name == data.nombre_inmobiliaria).first()
        if not tenant:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        if not hashing.verify_password(data.password, tenant.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
            
        # Generar token para el tenant directamente (legacy compatible)
        access_token = tokens.create_access_token(subject=tenant.email, tenant_id=tenant.id, role="INMOBILIARIA")
        return {"access_token": access_token, "token_type": "bearer", "user": {"email": tenant.email, "role": "INMOBILIARIA", "tenant_id": tenant.id}}

    # Si encontramos un usuario, usamos la lógica de seguridad avanzada
    return process_user_login(user, data.password, db)

@router.post("/login/admin")
def login_admin(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(
        or_(UserModel.email == data.identifier, UserModel.username == data.identifier)
    ).first()
    
    return process_user_login(user, data.password, db)

def process_user_login(user: UserModel, password: str, db: Session):
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # 1. Verificar Bloqueo
    if user.locked_until and user.locked_until > datetime.utcnow():
        diff = user.locked_until - datetime.utcnow()
        minutes = int(diff.total_seconds() / 60) + 1
        raise HTTPException(status_code=403, detail=f"Cuenta bloqueada temporalmente. Intente en {minutes} min.")

    # 2. Verificar Password
    if not hashing.verify_password(password, user.hashed_password):
        user.failed_attempts += 1
        if user.failed_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            logger.warning(f"🔒 Cuenta bloqueada por fuerza bruta: {user.email}")
        db.commit()
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # 3. Verificar Verificación de Email (excepto SuperAdmin)
    if not user.email_verified and user.role != "SUPERADMIN" and not user.is_system_account:
        raise HTTPException(status_code=403, detail="Email no verificado. Por favor, revise su casilla de correo.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta inactiva")

    # 4. Éxito: Resetear intentos
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()

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
            "tenant_id": user.tenant_id,
            "force_password_change": user.force_password_change
        }
    }

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    from app.application.services.verification_service import VerificationService
    success = VerificationService.verify_email(token, db)
    if not success:
        logger.warning(f"❌ Intento de verificación fallido con token: {token}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de verificación es inválido, ha expirado o ya ha sido utilizado."
        )
    logger.info("✅ Email verificado correctamente.")
    return {"message": "¡Email verificado con éxito! Ya puedes iniciar sesión en tu cuenta."}
