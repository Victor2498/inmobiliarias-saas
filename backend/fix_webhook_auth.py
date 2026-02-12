"""
Script para CORREGIR el Webhook de Evolution API con autenticación
"""
import httpx
import asyncio
import os

# Configuración
BACKEND_BASE_URL = "http://sistema_inmobiliaria:80/api/v1/webhooks/evolution"
# Token tomado de la configuración de producción
SECRET_KEY = "supersecretkeychangedinproduction" 
BACKEND_WEBHOOK_URL = f"{BACKEND_BASE_URL}?token={SECRET_KEY}"

EVOLUTION_API_URL = "http://evolution-api:8080"
EVOLUTION_API_TOKEN = "429683C4C977415CAAFCCE10F7D57E11"
INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"

async def fix_webhook():
    headers = {"apikey": EVOLUTION_API_TOKEN}
    
    print(f"Corrigiendo Webhook para: {INSTANCE_NAME}")
    print(f"Nueva URL con Token: {BACKEND_WEBHOOK_URL}")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Configurar Webhook con token
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
            # Endpoint para Evolution API v2
            resp = await client.post(
                f"{EVOLUTION_API_URL}/webhook/set/{INSTANCE_NAME}",
                headers=headers,
                json=webhook_data
            )
            
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
            
            if resp.status_code == 200:
                print("✅ Webhook corregido exitosamente")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_webhook())
