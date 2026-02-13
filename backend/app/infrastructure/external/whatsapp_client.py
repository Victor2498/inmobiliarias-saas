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
        # 1. Crear instancia
        data = {
            "instanceName": name,
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS"
        }
        create_resp = await self._safe_request("POST", "/instance/create", json=data)
        
        if not create_resp:
            return None

        # 2. Configurar Webhook automáticamente
        # En producción (Docker), el backend suele estar en el servicio 'sistema_inmobiliaria' o 'backend'
        base_url = settings.WEBHOOK_URL_OVERRIDE or "http://sistema_inmobiliaria:80/api/v1/webhooks/evolution"
        webhook_url = f"{base_url}?token={settings.SECRET_KEY}"
        
        webhook_data = {
            "webhook": {
                "enabled": True,
                "url": webhook_url,
                "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "SEND_MESSAGE"]
            }
        }
        
        # Intentar configurar webhook
        try:
            await self._safe_request("POST", f"/webhook/set/{name}", json=webhook_data)
        except Exception as e:
            logger.error(f"⚠️ Error configurando webhook: {e}")
            # No fallamos la creación si el webhook falla, pero logueamos error
            
        return create_resp

    async def get_qr_code(self, name: str):
        resp = await self._safe_request("GET", f"/instance/connect/{name}")
        return resp.get("base64") if resp else None

    async def get_instance_status(self, name: str):
        resp = await self._safe_request("GET", f"/instance/connectionState/{name}")
        if not resp: return "DISCONNECTED"
        status = resp.get("instance", {}).get("state", "DISCONNECTED")
        return "CONNECTED" if status == "open" else "DISCONNECTED"

    async def logout_instance(self, name: str):
        # Evolution API v2 suele usar DELETE para logout
        resp = await self._safe_request("DELETE", f"/instance/logout/{name}")
        if not resp:
             # Fallback para versiones nteriores
             resp = await self._safe_request("POST", f"/instance/logout/{name}")
        return resp is not None

    async def send_message(self, instance_name: str, number: str, text: str):
        """Envía un mensaje de texto a un número específico."""
        # Evolution API v2 simplificado
        data = {
            "number": number,
            "text": text,
            "delay": 1200,
            "linkPreview": False
        }
        return await self._safe_request("POST", f"/message/sendText/{instance_name}", json=data)

# Export instance for use as singleton
whatsapp_client = EvolutionAPIClient()
