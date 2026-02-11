from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.infrastructure.security.tenant_context import set_current_tenant_id
from jose import jwt
from app.core.config import settings

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Rutas excluidas de validación de tenant (Auth, Registro, Health)
        excluded_paths = ["/", "/docs", "/openapi.json", "/api/v1/auth", "/api/v1/tenants/register", "/assets"]
        
        if any(request.url.path.startswith(path) for path in excluded_paths):
            return await call_next(request)
            
        # 1. Intentar obtener tenant del Header
        tenant_id = request.headers.get("X-Tenant-ID")
        
        # 2. Si no hay Header, intentar obtener del Token JWT
        auth_header = request.headers.get("Authorization")
        if not tenant_id and auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                tenant_id = payload.get("tenant_id")
                role = payload.get("role")
                
                # Si es SUPERADMIN, permitimos bypass (o usamos un tenant_id ficticio)
                if role == "SUPERADMIN":
                    set_current_tenant_id(tenant_id or "admin")
                    return await call_next(request)
            except Exception:
                pass 
        
        if not tenant_id:
            raise HTTPException(status_code=403, detail="X-Tenant-ID header is missing or invalid token")
        
        # Inyectar tenant_id en el contexto global de la request
        set_current_tenant_id(tenant_id)
        
        response = await call_next(request)
        return response
