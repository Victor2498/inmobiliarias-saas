from contextvars import ContextVar
from typing import Optional

# Variable de contexto para almacenar el tenant_id de la request actual
_tenant_id_ctx: ContextVar[Optional[str]] = ContextVar("tenant_id", default=None)

def get_current_tenant_id() -> Optional[str]:
    return _tenant_id_ctx.get()

def set_current_tenant_id(tenant_id: str):
    _tenant_id_ctx.set(tenant_id)
