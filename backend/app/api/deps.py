from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.security.tokens import verify_token
from app.infrastructure.persistence.models import UserModel
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
        
    # Importante: Asegurar que el contexto del tenant esté seteado para el usuario logueado
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
                detail="The user doesn't have enough privileges"
            )
        return user
