import httpx
import asyncio

async def test_internal_dns():
    targets = [
        "http://sistema_inmobiliaria:8000/api/v1/whatsapp/status",
        "http://localhost:8000/api/v1/whatsapp/status"
    ]
    
    print("🌐 Probando resolución de nombres interna...")
    async with httpx.AsyncClient() as client:
        for url in targets:
            try:
                resp = await client.get(url, timeout=5.0)
                print(f"✅ {url} -> {resp.status_code}")
            except Exception as e:
                print(f"❌ {url} -> ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_internal_dns())
