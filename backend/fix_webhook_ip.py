"""
Script para CORREGIR el Webhook de Evolution API - INTENTO 4 (IP Directa)
"""
import httpx
import asyncio
import os

# Usamos la IP interna que nos diste: 10.0.1.168 (la de la red interna de Docker probablemente)
# O la 10.11.11.24. Probaremos ambas si la primera falla, pero la 10.0.x suele ser la custom bridge.
TARGET_IP = "10.0.1.168" 
TARGET_URL = f"http://{TARGET_IP}:8000/api/v1/webhooks/evolution"

# Token tomado de la configuración de producción
SECRET_KEY = "supersecretkeychangedinproduction" 
BACKEND_WEBHOOK_URL = f"{TARGET_URL}?token={SECRET_KEY}"

EVOLUTION_API_URL = "http://evolution-api:8080"
EVOLUTION_API_TOKEN = "429683C4C977415CAAFCCE10F7D57E11"
INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"

async def fix_webhook_ip():
    headers = {"apikey": EVOLUTION_API_TOKEN}
    
    print(f"Corrigiendo Webhook para: {INSTANCE_NAME}")
    print(f"Probando IP Directa: {BACKEND_WEBHOOK_URL}")
    
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
            resp = await client.post(
                f"{EVOLUTION_API_URL}/webhook/set/{INSTANCE_NAME}",
                headers=headers,
                json=webhook_data
            )
            
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
            
            if resp.status_code == 200:
                print("✅ Webhook reconfigurado con IP. ¡Prueba enviar un mensaje ahora!")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_webhook_ip())
