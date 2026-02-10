from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.middleware import TenantMiddleware
from app.core.config import settings

from app.api.v1.endpoints import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # Middlewares
    app.add_middleware(TenantMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rutas
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/")
    async def health_check():
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    return app

app = create_app()
