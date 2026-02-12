import secrets
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.domain.models.user import EmailVerificationTokenModel, UserModel

class VerificationService:
    @staticmethod
    def generate_token(user_id: int, db: Session) -> str:
        """Genera un token seguro y guarda su hash en la DB."""
        raw_token = secrets.token_hex(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        
        # Expiración: 24 horas segun SPEC
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Eliminar tokens viejos del mismo usuario
        db.query(EmailVerificationTokenModel).filter(
            EmailVerificationTokenModel.user_id == user_id
        ).delete()
        
        db_token = EmailVerificationTokenModel(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(db_token)
        db.commit()
        
        return raw_token

    @staticmethod
    def verify_email(raw_token: str, db: Session) -> bool:
        """Valida el token y activa al usuario."""
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        
        db_token = db.query(EmailVerificationTokenModel).filter(
            EmailVerificationTokenModel.token_hash == token_hash,
            EmailVerificationTokenModel.used == False,
            EmailVerificationTokenModel.expires_at > datetime.utcnow()
        ).first()
        
        if not db_token:
            return False
            
        # 1. Marcar token como usado
        db_token.used = True
        
        # 2. Activar usuario y verificar email
        user = db.query(UserModel).filter(UserModel.id == db_token.user_id).first()
        if user:
            user.email_verified = True
            user.is_active = True
            db.commit()
            return True
            
        return False
