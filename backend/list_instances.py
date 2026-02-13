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
            
            # Debug: Imprimir estructura del primero
            if instances:
                print("Estructura RAW del primero:", instances[0])

            for inst in instances:
                # Intento de compatibilidad con varias versiones
                if isinstance(inst, dict):
                    name = inst.get('instance', {}).get('instanceName') or inst.get('instanceName') or inst.get('name') or 'N/A'
                    status = inst.get('instance', {}).get('state') or inst.get('state') or inst.get('status') or 'UNKNOWN'
                    owner = inst.get('instance', {}).get('owner') or inst.get('owner') or 'No info'
                else:
                    name = str(inst)
                    status = "???"
                    owner = "???"

                print(f"👉 {name}")
                print(f"   Status: {status}")
                print(f"   Owner: {owner}")
                print("-----------------------------------")
    except Exception as e:
        print(f"❌ Error conectando a Evolution API: {e}")

if __name__ == "__main__":
    asyncio.run(list_instances())
