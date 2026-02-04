from fastapi import APIRouter
from app.api.v1.endpoints import contracts, tenants, payments, whatsapp

api_router = APIRouter()
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
