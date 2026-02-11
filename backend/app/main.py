from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.api.middleware import TenantMiddleware
from app.core.config import settings

from app.api.v1.endpoints import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.1", # Incrementamos versión
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )
    print("🚀 SISTEMA INMOBILIARIO v1.0.1 - FRONTEND UNIFICADO CARGANDO...")

    # Middlewares
    app.add_middleware(TenantMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "https://sistemainmobiliario.agentech.ar"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rutas API
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Servir archivos estáticos del frontend
    if os.path.exists("static"):
        print("✅ Carpeta 'static' encontrada. Serviendo Frontend...")
        app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
        
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            file_path = os.path.join("static", full_path)
            if os.path.isfile(file_path):
                return FileResponse(file_path)
            return FileResponse("static/index.html")
    else:
        print("⚠️ ADVERTENCIA: Carpeta 'static' NO encontrada. El frontend no se cargará.")

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    return app

app = create_app()
