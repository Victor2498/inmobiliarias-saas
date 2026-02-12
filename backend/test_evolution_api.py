"""
Script de diagnóstico para Evolution API
Verifica la conectividad y endpoints básicos
"""
import httpx
import asyncio
import json

# Configuración
EVOLUTION_API_URL = "http://evolution-api:8080"  # Cambiar si es necesario
EVOLUTION_API_TOKEN = "your-api-key"

async def test_evolution_api():
    headers = {"apikey": EVOLUTION_API_TOKEN}
    
    print("=" * 60)
    print("DIAGNÓSTICO DE EVOLUTION API")
    print("=" * 60)
    print(f"URL: {EVOLUTION_API_URL}")
    print(f"Token: {EVOLUTION_API_TOKEN[:10]}...")
    print()
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test 1: Health check
        print("1️⃣  Test de conectividad...")
        try:
            resp = await client.get(f"{EVOLUTION_API_URL}/", headers=headers)
            print(f"   ✅ Conectado - Status: {resp.status_code}")
            print(f"   Respuesta: {resp.text[:200]}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
            return
        
        print()
        
        # Test 2: Listar instancias
        print("2️⃣  Listando instancias existentes...")
        try:
            resp = await client.get(f"{EVOLUTION_API_URL}/instance/fetchInstances", headers=headers)
            if resp.status_code == 200:
                instances = resp.json()
                print(f"   ✅ Instancias encontradas: {len(instances)}")
                for inst in instances:
                    print(f"      - {inst.get('instance', {}).get('instanceName', 'N/A')}")
            else:
                print(f"   ⚠️  Status: {resp.status_code}")
                print(f"   Respuesta: {resp.text}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print()
        
        # Test 3: Crear instancia de prueba
        print("3️⃣  Creando instancia de prueba...")
        test_instance_name = "test_diagnostic_instance"
        payload = {
            "instanceName": test_instance_name,
            "token": "admin123",
            "qrcode": True
        }
        
        try:
            resp = await client.post(
                f"{EVOLUTION_API_URL}/instance/create",
                headers=headers,
                json=payload
            )
            print(f"   Status: {resp.status_code}")
            print(f"   Respuesta: {json.dumps(resp.json(), indent=2)}")
            
            if resp.status_code == 201 or resp.status_code == 200:
                print("   ✅ Instancia creada exitosamente")
                
                # Test 4: Obtener QR
                print()
                print("4️⃣  Obteniendo código QR...")
                await asyncio.sleep(2)  # Esperar un poco
                
                qr_resp = await client.get(
                    f"{EVOLUTION_API_URL}/instance/connect/{test_instance_name}",
                    headers=headers
                )
                print(f"   Status: {qr_resp.status_code}")
                if qr_resp.status_code == 200:
                    qr_data = qr_resp.json()
                    if "base64" in qr_data:
                        print("   ✅ QR Code obtenido correctamente")
                        print(f"   Longitud del QR: {len(qr_data['base64'])} caracteres")
                    else:
                        print(f"   ⚠️  Respuesta: {qr_data}")
                else:
                    print(f"   ❌ Error: {qr_resp.text}")
                
                # Cleanup: Eliminar instancia de prueba
                print()
                print("5️⃣  Limpiando instancia de prueba...")
                delete_resp = await client.delete(
                    f"{EVOLUTION_API_URL}/instance/delete/{test_instance_name}",
                    headers=headers
                )
                print(f"   Status: {delete_resp.status_code}")
                
            else:
                print(f"   ❌ Error al crear instancia: {resp.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print()
    print("=" * 60)
    print("DIAGNÓSTICO COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_evolution_api())
