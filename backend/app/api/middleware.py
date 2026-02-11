from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.infrastructure.security.tenant_context import set_current_tenant_id
from jose import jwt
from app.core.config import settings

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        excluded = [
            "/", "/docs", "/openapi.json", "/api/v1/auth", 
            "/api/v1/tenants/register", "/assets",
            "/api/v1/payments/webhook", "/api/v1/webhooks/evolution"
        ]
        if any(request.url.path.startswith(p) for p in excluded):
            return await call_next(request)
            
        tenant_id = None
        auth_h = request.headers.get("Authorization")
        
        if auth_h and auth_h.startswith("Bearer "):
            token = auth_h.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                jwt_tenant_id = payload.get("tenant_id")
                role = payload.get("role")
                
                if role == "SUPERADMIN":
                    # Solo el SUPERADMIN puede sobreescribir el tenant_id via header
                    tenant_id = request.headers.get("X-Tenant-ID") or jwt_tenant_id or "admin"
                else:
                    # Usuarios normales SIEMPRE usan el tenant_id de su token
                    tenant_id = jwt_tenant_id
            except:
                # Token invalido
                raise HTTPException(status_code=401, detail="Sesion invalida o expirada")
        
        # ELIMINADO: Fallback inseguro que permitia tenant_id desde header sin JWT
        
        if not tenant_id:
            raise HTTPException(status_code=403, detail="Acceso denegado: Identificador de inquilino no validado.")
            
        set_current_tenant_id(tenant_id)
        return await call_next(request)
