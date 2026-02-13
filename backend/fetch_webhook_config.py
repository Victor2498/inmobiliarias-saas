import httpx
import asyncio

async def fetch_webhook_config():
    headers = {'apikey': '429683C4C977415CAAFCCE10F7D57E11'}
    url = "http://evolution-api:8080/webhook/find/tenant_a866a4c0-c219-4ec8"
    
    print(f"🔍 Consultando configuración de webhook en {url}...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers)
            print(f"Status Code: {resp.status_code}")
            print(f"Configuración actual:\n{resp.text}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fetch_webhook_config())
