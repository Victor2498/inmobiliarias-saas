import logging
from typing import Generic, TypeVar, Type, List, Optional, Any
from sqlalchemy.orm import Session, Query
from app.domain.models.tenant import TenantModel
from app.infrastructure.security.tenant_context import get_current_tenant_id

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=TenantModel)

class BaseRepository(Generic[T]):
    """
    Repositorio base que aplica filtrado por tenant_id automaticamente.
    Garantiza que ningun tenant acceda a datos de otro.
    """
    def __init__(self, model: Type[T], db: Session, tenant_id: Optional[str] = None):
        self.model = model
        self.db = db
        self.explicit_tenant_id = tenant_id

    def _get_query(self) -> Query:
        # Priorizar explicit_tenant_id si fue pasado al constructor
        tenant_id = self.explicit_tenant_id or get_current_tenant_id()
        
        query = self.db.query(self.model)
        if hasattr(self.model, 'tenant_id'):
            if tenant_id:
                logger.debug(f"Filtering {self.model.__tablename__} by tenant_id='{tenant_id}' (Source: {'Explicit' if self.explicit_tenant_id else 'Context'})")
                query = query.filter(self.model.tenant_id == tenant_id)
            else:
                logger.warning(f"NO TENANT_ID found in context or explicit for {self.model.__tablename__}")
                query = query.filter(False)
        return query

    def get(self, id: Any, options: List[Any] = None) -> Optional[T]:
        query = self._get_query()
        if options:
            for option in options:
                query = query.options(option)
        return query.filter(self.model.id == id).first()

    def list(self, skip: int = 0, limit: int = 100, options: List[Any] = None) -> List[T]:
        query = self._get_query()
        if options:
            for option in options:
                query = query.options(option)
        return query.offset(skip).limit(limit).all()

    def count(self) -> int:
        return self._get_query().count()

    def create(self, obj_in: dict) -> T:
        tenant_id = self.explicit_tenant_id or get_current_tenant_id()
        if hasattr(self.model, 'tenant_id') and "tenant_id" not in obj_in:
            obj_in["tenant_id"] = tenant_id
        
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
