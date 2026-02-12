from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.security.tokens import verify_token
from app.domain.models.user import UserModel
from app.infrastructure.security.tenant_context import set_current_tenant_id

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)) -> UserModel:
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Importante: Asegurar que el contexto del tenant este seteado para el usuario logueado
    if user.role != "SUPERADMIN":
        set_current_tenant_id(user.tenant_id)
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: UserModel = Depends(get_current_user)):
        if user.role not in self.allowed_roles and user.role != "SUPERADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario no tiene suficientes privilegios"
            )
        return user

class PlanChecker:
    def __init__(self, required_plans: list):
        self.required_plans = required_plans

    def __call__(self, db: Session = Depends(get_db), user: UserModel = Depends(get_current_user)):
        from app.domain.models.user import UserModel
        from app.domain.models.tenant import TenantModel
        tenant = db.query(TenantModel).filter(TenantModel.id == user.tenant_id).first()
        
        if not tenant:
            raise HTTPException(status_code=404, detail="Inmobiliaria no encontrada")
            
        if tenant.plan not in self.required_plans and user.role != "SUPERADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Esta funcionalidad requiere un plan superior ({', '.join(self.required_plans)})"
            )
        return user
