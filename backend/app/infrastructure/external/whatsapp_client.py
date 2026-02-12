import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EvolutionAPIClient:
    def __init__(self):
        self.url = settings.EVOLUTION_API_URL
        self.token = settings.EVOLUTION_API_TOKEN
        self.headers = {"apikey": self.token}

    async def create_instance(self, name: str):
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "instanceName": name,
                    "token": "admin123", # Token interno opcional
                    "qrcode": True
                }
                resp = await client.post(f"{self.url}/instance/create", json=data, headers=self.headers)
                return resp.json()
        except Exception as e:
            logger.error(f"Error creating MP instance: {e}")
            return None

    async def get_qr_code(self, name: str):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{self.url}/instance/connect/{name}", headers=self.headers)
                return resp.json().get("base64")
        except Exception as e:
            logger.error(f"Error getting QR: {e}")
            return None

    async def get_instance_status(self, name: str):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{self.url}/instance/connectionState/{name}", headers=self.headers)
                status = resp.json().get("instance", {}).get("state", "DISCONNECTED")
                return "CONNECTED" if status == "open" else "DISCONNECTED"
        except:
            return "DISCONNECTED"

    async def logout_instance(self, name: str):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"{self.url}/instance/logout/{name}", headers=self.headers)
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Error logout: {e}")
            return False

# Export instance for use as singleton
whatsapp_client = EvolutionAPIClient()
