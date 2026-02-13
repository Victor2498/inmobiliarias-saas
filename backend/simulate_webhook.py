import httpx
import asyncio

# Payload simulado de Evolution API v2
payload = {
  "event": "MESSAGES_UPSERT",
  "instance": "tenant_a866a4c0-c219-4ec8",
  "data": {
    "key": {
      "remoteJid": "5491112345678@s.whatsapp.net",
      "fromMe": False,
      "id": "BAE5F6B9C8E9"
    },
    "pushName": "Usuario Test",
    "message": {
      "conversation": "Hola, prueba de simulation"
    },
    "messageType": "conversation",
    "messageTimestamp": 1707860000,
    "owner": "tenant_a866a4c0-c219-4ec8",
    "source": "android"
  },
  "destination": "http://sistema_inmobiliaria:8000/api/v1/webhooks/evolution"
}

TOKEN = "supersecretkeychangedinproduction"
URL = f"http://localhost:8000/api/v1/webhooks/evolution?token={TOKEN}"

async def test_simulated_webhook():
    print(f"📡 Enviando webhook simulado a {URL}...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(URL, json=payload)
            print(f"🔄 Status Code: {resp.status_code}")
            print(f"📄 Response: {resp.text}")
            
            if resp.status_code == 200:
                print("✅ Backend recibió el webhook correctamente.")
                print("👉 Ahora revisa los logs del backend para ver si procesó el mensaje y respondió.")
            else:
                print("❌ El backend rechazó el webhook.")
        except Exception as e:
            print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    asyncio.run(test_simulated_webhook())
