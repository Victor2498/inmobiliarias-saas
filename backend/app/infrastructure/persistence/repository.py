from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.orm import Session
from app.infrastructure.persistence.models import Base
from app.infrastructure.security.tenant_context import get_current_tenant_id

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    """
    Repositorio base que aplica filtrado por tenant_id automaticamente.
    Garantiza que ningun tenant acceda a datos de otro.
    """
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def _get_tenant_filter(self):
        tenant_id = get_current_tenant_id()
        if not tenant_id:
            # Bloqueo total si no hay contexto de tenant
            return False 
        return self.model.tenant_id == tenant_id

    def get(self, id: any) -> Optional[T]:
        return self.db.query(self.model).filter(
            self.model.id == id,
            self._get_tenant_filter()
        ).first()

    def list(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model).filter(
            self._get_tenant_filter()
        ).offset(skip).limit(limit).all()

    def create(self, obj_in: dict) -> T:
        # Forzar el tenant_id del contexto actual
        tenant_id = get_current_tenant_id()
        obj_in["tenant_id"] = tenant_id
        
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
