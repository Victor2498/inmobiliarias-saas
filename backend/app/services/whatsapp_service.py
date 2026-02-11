import httpx
import json
from typing import Optional, Dict, Any
from app.core.config import settings

class WhatsAppService:
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.api_key = settings.EVOLUTION_API_TOKEN
        self.headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json"
        }

    async def create_instance(self, instance_name: str) -> Dict[str, Any]:
        """Crea una nueva instancia en Evolution API."""
        url = f"{self.base_url}/instance/create"
        payload = {
            "instanceName": instance_name,
            "token": settings.EVOLUTION_API_TOKEN,
            "qrcode": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)
            return response.json()

    async def get_qr_code(self, instance_name: str) -> Optional[str]:
        """Obtiene el código QR de una instancia existente."""
        url = f"{self.base_url}/instance/connect/{instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data.get("base64")
            return None

    async def get_instance_status(self, instance_name: str) -> str:
        """Obtiene el estado actual de la instancia."""
        url = f"{self.base_url}/instance/connectionState/{instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                # Mapear estados de Evolution API a nuestros estados internos
                state = data.get("instance", {}).get("state", "DISCONNECTED")
                return "CONNECTED" if state == "open" else "DISCONNECTED"
            return "ERROR"

    async def logout_instance(self, instance_name: str) -> bool:
        """Cierra la sesión de WhatsApp en la instancia."""
        url = f"{self.base_url}/instance/logout/{instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=self.headers)
            return response.status_code == 200

    async def delete_instance(self, instance_name: str) -> bool:
        """Elimina la instancia de Evolution API."""
        url = f"{self.base_url}/instance/delete/{instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=self.headers)
            return response.status_code == 200

whatsapp_service = WhatsAppService()
