"""
Script para configurar el Webhook de Evolution API
"""
import httpx
import asyncio
import os

# Configuración
# En Easypanel, el nombre del servicio del backend suele ser el nombre del proyecto_servicio o simplemente el nombre del servicio
# Intentaremos con 'sistema_inmobiliaria' que es el nombre que vimos en el panel.
# El puerto interno suele ser 80 o el puerto de la app (8000).
BACKEND_WEBHOOK_URL = "http://sistema_inmobiliaria:80/api/v1/webhooks/evolution"
EVOLUTION_API_URL = "http://evolution-api:8080"
EVOLUTION_API_TOKEN = "429683C4C977415CAAFCCE10F7D57E11"
INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"

async def setup_webhook():
    headers = {"apikey": EVOLUTION_API_TOKEN}
    
    print(f"Configurando Webhook para: {INSTANCE_NAME}")
    print(f"URL Destino: {BACKEND_WEBHOOK_URL}")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Configurar Webhook
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
                print("✅ Webhook configurado exitosamente via /webhook/set")
            else:
                # Intentar con /instance/update (otra forma en v2)
                print("⚠️ Intentando método alternativo...")
                resp2 = await client.post(
                    f"{EVOLUTION_API_URL}/instance/update/{INSTANCE_NAME}",
                    headers=headers,
                    json=webhook_data
                )
                print(f"Status Alt: {resp2.status_code}")
                print(f"Response Alt: {resp2.text}")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(setup_webhook())
