from fastapi import APIRouter
from app.api.v1 import auth, tenants, properties, webhooks, whatsapp, people, contracts, admin, payments

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(people.router, prefix="/people", tags=["people"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
