import httpx
import asyncio

async def list_instances():
    headers = {'apikey': '429683C4C977415CAAFCCE10F7D57E11'}
    try:
        async with httpx.AsyncClient() as client:
            # Listar todas las instancias
            print("Consultando instancias en Evolution API...")
            resp = await client.get('http://evolution-api:8080/instance/fetchInstances', headers=headers)
            instances = resp.json()
            
            print(f"\n--- Instancias Encontradas ({len(instances)}) ---")
            for inst in instances:
                name = inst.get('instance', {}).get('instanceName', 'N/A')
                status = inst.get('instance', {}).get('state', 'UNKNOWN') # Puede variar segun version
                owner = inst.get('instance', {}).get('owner', 'No info')
                print(f"👉 {name}")
                print(f"   Status: {status}")
                print(f"   Owner: {owner}")
                print("-----------------------------------")
    except Exception as e:
        print(f"❌ Error conectando a Evolution API: {e}")

if __name__ == "__main__":
    asyncio.run(list_instances())
