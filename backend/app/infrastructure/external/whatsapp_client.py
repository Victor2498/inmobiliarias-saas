import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EvolutionAPIClient:
    def __init__(self):
        self.url = settings.EVOLUTION_API_URL.rstrip("/") if settings.EVOLUTION_API_URL else ""
        self.token = settings.EVOLUTION_API_TOKEN
        self.headers = {"apikey": self.token or ""}

    async def _safe_request(self, method: str, path: str, **kwargs):
        """Maneja peticiones con logging y manejo de errores robusto."""
        if not self.token:
            logger.error("❌ Evolution API Token no configurado")
            return None

        url = f"{self.url}/{path.lstrip('/')}"
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:  # Aumentado a 30s para creación de instancias
                resp = await client.request(method, url, headers=self.headers, **kwargs)
                
                if resp.status_code >= 400:
                    logger.error(f"❌ Error en Evolution API ({method} {path}): Status {resp.status_code} - {resp.text}")
                    return None
                
                try:
                    return resp.json()
                except Exception:
                    logger.error(f"❌ La respuesta de Evolution API no es JSON válido ({method} {path})")
                    return None
        except Exception as e:
            logger.error(f"❌ Error de conexión con Evolution API ({method} {path}): {str(e)}")
            return None

    async def create_instance(self, name: str):
        data = {
            "instanceName": name,
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS"  # Requerido para Evolution API v2
        }
        return await self._safe_request("POST", "/instance/create", json=data)

    async def get_qr_code(self, name: str):
        resp = await self._safe_request("GET", f"/instance/connect/{name}")
        return resp.get("base64") if resp else None

    async def get_instance_status(self, name: str):
        resp = await self._safe_request("GET", f"/instance/connectionState/{name}")
        if not resp: return "DISCONNECTED"
        status = resp.get("instance", {}).get("state", "DISCONNECTED")
        return "CONNECTED" if status == "open" else "DISCONNECTED"

    async def logout_instance(self, name: str):
        resp = await self._safe_request("POST", f"/instance/logout/{name}")
        return resp is not None

# Export instance for use as singleton
whatsapp_client = EvolutionAPIClient()
