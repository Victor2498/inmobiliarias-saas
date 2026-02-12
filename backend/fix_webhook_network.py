"""
Script para CORREGIR el Webhook de Evolution API - INTENTO 3 (Red Interna)
"""
import httpx
import asyncio
import os

# En Easypanel, los contenedores a veces se comunican por localhost si comparten red estilo 'host' (raro)
# o por el nombre del servicio.
# Si 'sistema_inmobiliaria' falló, probemos opciones comunes en Easypanel:
# 1. nombre-del-proyecto_nombre-del-servicio (ej: sistema_inmobiliario_sistema_inmobiliaria)
# 2. backend (si se llama así el servicio)
# 3. app (a veces)

# Vamos a probar con la IP del gateway de docker o el nombre completo que vimos en el prompt del usuario
# El prompt decía: root@00164571638d:/app
# El servicio se llama 'sistema_inmobiliaria' en la URL del panel.

# INTENTO: Usar el nombre del servicio pero puerto 8000 (el interno de uvicorn)
TARGET_URL = "http://sistema_inmobiliaria:8000/api/v1/webhooks/evolution"

# Token tomado de la configuración de producción
SECRET_KEY = "supersecretkeychangedinproduction" 
BACKEND_WEBHOOK_URL = f"{TARGET_URL}?token={SECRET_KEY}"

EVOLUTION_API_URL = "http://evolution-api:8080"
EVOLUTION_API_TOKEN = "429683C4C977415CAAFCCE10F7D57E11"
INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"

async def fix_webhook_network():
    headers = {"apikey": EVOLUTION_API_TOKEN}
    
    print(f"Corrigiendo Webhook para: {INSTANCE_NAME}")
    print(f"Probando URL Interna: {BACKEND_WEBHOOK_URL}")
    
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
                print("✅ Webhook reconfigurado. ¡Prueba enviar un mensaje ahora!")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_webhook_network())
