
import httpx
import asyncio
import socket

async def get_internal_ip():
    try:
        # Esto obtiene la IP del contenedor actual (backend)
        return socket.gethostbyname(socket.gethostname())
    except:
        return None

async def super_fix():
    print("--- 🚀 Iniciando Super Fix de Webhook ---")
    
    headers = {'apikey': '429683C4C977415CAAFCCE10F7D57E11'}
    instance_name = "tenant_a866a4c0-c219-4ec8"
    token = "supersecretkeychangedinproduction"
    
    # 1. Intentar con nombre de servicio
    hostname = "sistema_inmobiliaria"
    
    # 2. Intentar obtener IP interna
    internal_ip = await get_internal_ip()
    print(f"📍 Mi IP interna detectada: {internal_ip}")
    
    # Vamos a usar la IP interna si está disponible, es lo más "bruto" y efectivo
    target_host = internal_ip if internal_ip else hostname
    webhook_url = f"http://{target_host}:8000/api/v1/webhooks/evolution?token={token}"
    
    print(f"🔗 Configurando Webhook en: {webhook_url}")
    
    data = {
        "url": webhook_url,
        "enabled": True,
        "webhookByEvents": False,
        "events": [
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "SEND_MESSAGE"
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"http://evolution-api:8080/webhook/set/{instance_name}",
                headers=headers,
                json=data
            )
            print(f"✅ Resultado: {resp.status_code}")
            print(f"📄 Respuesta: {resp.text}")
            
            # Reiniciar instancia para asegurar que tome los cambios
            print(f"🔄 Reiniciando instancia {instance_name}...")
            await client.post(f"http://evolution-api:8080/instance/logout/{instance_name}", headers=headers)
            # El login se hace automático al enviar mensaje o conectar
            
            print("\n✨ Webhook configurado. ¡Prueba enviar un mensaje ahora!")
            
    except Exception as e:
        print(f"❌ Error durante el fix: {e}")

if __name__ == "__main__":
    asyncio.run(super_fix())
