from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.api.middleware import TenantMiddleware
from app.core.config import settings
from app.api.v1.endpoints import api_router

def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, version="1.0.1")
    app.add_middleware(TenantMiddleware)
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    app.include_router(api_router, prefix=settings.API_V1_STR)
    if os.path.exists("static"):
        app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            file_path = os.path.join("static", full_path)
            if os.path.isfile(file_path): return FileResponse(file_path)
            return FileResponse("static/index.html")
    return app
app = create_app()
