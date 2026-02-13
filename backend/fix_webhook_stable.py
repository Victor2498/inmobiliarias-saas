"""
Script para CONFIGURACIÓN ESTABLE del Webhook
Usamos el nombre de servicio Docker + Puerto 8000
"""
import httpx
import asyncio
import os

# Nombre del servicio en Easypanel + Puerto interno del container
TARGET_HOST = "sistema_inmobiliaria"
TARGET_PORT = "8000"
TARGET_URL = f"http://{TARGET_HOST}:{TARGET_PORT}/api/v1/webhooks/evolution"

SECRET_KEY = "supersecretkeychangedinproduction" 
BACKEND_WEBHOOK_URL = f"{TARGET_URL}?token={SECRET_KEY}"

EVOLUTION_API_URL = "http://evolution-api:8080"
EVOLUTION_API_TOKEN = "429683C4C977415CAAFCCE10F7D57E11"
INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"

async def fix_webhook_stable():
    headers = {"apikey": EVOLUTION_API_TOKEN}
    
    print(f"--- Configurando Webhook Estable ---")
    print(f"Instancia: {INSTANCE_NAME}")
    print(f"URL Webhook: {BACKEND_WEBHOOK_URL}")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        webhook_data = {
            "webhook": {
                "enabled": True,
                "url": BACKEND_WEBHOOK_URL,
                "events": [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "SEND_MESSAGE"
                ]
            }
        }
        
        try:
            # 1. Verificar si la instancia existe
            status_resp = await client.get(
                f"{EVOLUTION_API_URL}/instance/connectionState/{INSTANCE_NAME}", 
                headers=headers
            )
            if status_resp.status_code != 200:
                print(f"⚠️ La instancia no parece existir o no responde (Status {status_resp.status_code})")
                return

            # 2. Configurar Webhook
            resp = await client.post(
                f"{EVOLUTION_API_URL}/webhook/set/{INSTANCE_NAME}",
                headers=headers,
                json=webhook_data
            )
            
            print(f"Webhook Set Result: {resp.status_code} - {resp.text}")
            
            if resp.status_code == 200:
                print("✅ Webhook reconfigurado exitosamente.")
                print("NOTA: Si el backend se reinicia, la IP cambia, pero 'sistema_inmobiliaria' debería mantenerse.")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_webhook_stable())
