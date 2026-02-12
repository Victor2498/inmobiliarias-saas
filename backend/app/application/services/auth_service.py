import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.domain.models.tenant import TenantModel
from app.domain.models.user import UserModel, EmailVerificationTokenModel
from app.infrastructure.security import hashing, tokens
from app.api.v1.schemas import TenantLogin, UserLogin, ChangePassword
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login_tenant(self, data: TenantLogin) -> Dict[str, Any]:
        """
        Maneja el login de Inmobiliarias.
        Busca usuario asociado o fallback a modelo Tenant legacy.
        """
        # 1. Buscamos usuario (Admin de la inmobiliaria)
        user = self.db.query(UserModel).filter(
            or_(UserModel.email == data.nombre_inmobiliaria, UserModel.username == data.nombre_inmobiliaria)
        ).first()

        if user:
            return self._process_user_login(user, data.password)

        # 2. Fallback: Buscar Tenant Legacy
        tenant = self.db.query(TenantModel).filter(TenantModel.name == data.nombre_inmobiliaria).first()
        if not tenant:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        if not hashing.verify_password(data.password, tenant.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
            
        # Generar token legacy
        access_token = tokens.create_access_token(subject=tenant.email, tenant_id=tenant.id, role="INMOBILIARIA")
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user": {
                "email": tenant.email, 
                "role": "INMOBILIARIA", 
                "tenant_id": tenant.id
            }
        }

    def login_admin(self, data: UserLogin) -> Dict[str, Any]:
        """
        Maneja login de usuarios internos (Admins, Asesores, SuperAdmin).
        """
        user = self.db.query(UserModel).filter(
            or_(UserModel.email == data.identifier, UserModel.username == data.identifier)
        ).first()
        
        return self._process_user_login(user, data.password)

    def change_password(self, current_user: UserModel, data: ChangePassword) -> None:
        """
        Cambia la contraseña del usuario actual.
        """
        if not hashing.verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta.")
        
        if len(data.new_password) < 8:
            raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 8 caracteres.")
            
        current_user.hashed_password = hashing.get_password_hash(data.new_password)
        current_user.force_password_change = False
        self.db.commit()
        logger.info(f"🔑 Contraseña actualizada para: {current_user.email}")

    def _process_user_login(self, user: Optional[UserModel], password: str) -> Dict[str, Any]:
        """
        Lógica central de validación de usuario (Bloqueo, Verificación, Password).
        """
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
            logger.warning(f"❌ Intento de login fallido para: {user.email} (Intento {user.failed_attempts}/5)")
            if user.failed_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(minutes=15)
                logger.critical(f"🔒 BLOQUEO DE CUENTA activado: {user.email}")
            self.db.commit()
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        # 3. Verificar Verificación de Email
        if not user.email_verified and user.role != "SUPERADMIN" and not user.is_system_account:
            logger.info(f"🚫 Login bloqueado por falta de verificación: {user.email}")
            raise HTTPException(status_code=403, detail="Email no verificado. Revise su correo.")

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Cuenta inactiva")

        # 4. Éxito
        user.failed_attempts = 0
        user.locked_until = None
        self.db.commit()
        logger.info(f"✅ Login exitoso: {user.email}")

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
