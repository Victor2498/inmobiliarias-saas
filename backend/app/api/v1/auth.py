import logging
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.schemas import TenantLogin, UserLogin, ChangePassword
from app.api.deps import get_current_user as get_user_dep
from app.domain.models.user import UserModel
from app.application.services.auth_service import AuthService
from app.application.services.verification_service import VerificationService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/login/tenant")
def login_tenant(data: TenantLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login_tenant(data)

@router.post("/login/admin")
def login_admin(data: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login_admin(data)

@router.get("/me")
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_user_dep)
):
    """Obtiene información del usuario actual y su tenant"""
    from app.domain.models.tenant import TenantModel
    
    tenant_data = None
    if current_user.tenant_id:
        tenant = db.query(TenantModel).filter(
            TenantModel.id == current_user.tenant_id
        ).first()
        if tenant:
            tenant_data = {
                "id": tenant.id,
                "name": tenant.name,
                "commercial_name": tenant.commercial_name,
                "plan": tenant.plan
            }
    
    return {
        "email": current_user.email,
        "role": current_user.role,
        "tenant_id": current_user.tenant_id,
        "tenant": tenant_data
    }

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    success = VerificationService.verify_email(token, db)
    if not success:
        logger.warning(f"❌ Intento de verificación fallido con token: {token}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de verificación es inválido, ha expirado o ya ha sido utilizado."
        )
    logger.info("✅ Email verificado correctamente.")
    return {"message": "¡Email verificado con éxito! Ya puedes iniciar sesión en tu cuenta."}

@router.post("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_user_dep)
):
    service = AuthService(db)
    # Note: AuthService.change_password expects current_user object and data
    service.change_password(current_user, data)
    return {"message": "Contraseña actualizada correctamente."}

