from fastapi import APIRouter
from app.api.v1 import auth, tenants, properties

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
