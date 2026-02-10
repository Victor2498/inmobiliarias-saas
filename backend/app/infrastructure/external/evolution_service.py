import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EvolutionService:
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.headers = {
            "apikey": settings.EVOLUTION_API_TOKEN,
            "Content-Type": "application/json"
        }

    async def create_instance(self, instance_name: str):
        url = f"{self.base_url}/instance/create"
        payload = {
            "instanceName": instance_name,
            "token": settings.EVOLUTION_API_TOKEN, # O un token específico
            "qrcode": True
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            return response.json()

    async def send_text(self, instance_name: str, number: str, text: str):
        url = f"{self.base_url}/message/sendText/{instance_name}"
        payload = {
            "number": number,
            "options": {"delay": 1200, "presence": "composing", "linkPreview": False},
            "textMessage": {"text": text}
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            return response.json()

    async def set_webhook(self, instance_name: str, webhook_url: str):
        url = f"{self.base_url}/webhook/set/{instance_name}"
        payload = {
            "enabled": True,
            "url": webhook_url,
            "webhook_by_events": False,
            "events": [
                "MESSAGES_UPSERT",
                "QRCODE_UPDATED",
                "CONNECTION_UPDATE"
            ]
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            return response.json()
