from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.infrastructure.security.tenant_context import set_current_tenant_id

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Rutas excluidas de validación de tenant (Auth, Registro, Health)
        excluded_paths = ["/", "/docs", "/openapi.json", "/api/v1/auth", "/api/v1/tenants/register"]
        
        if any(request.url.path.startswith(path) for path in excluded_paths):
            return await call_next(request)
            
        tenant_id = request.headers.get("X-Tenant-ID")
        
        if not tenant_id:
            raise HTTPException(status_code=403, detail="X-Tenant-ID header is missing")
        
        # Inyectar tenant_id en el contexto global de la request
        set_current_tenant_id(tenant_id)
        
        response = await call_next(request)
        return response
