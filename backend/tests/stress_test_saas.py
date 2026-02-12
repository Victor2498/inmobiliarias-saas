import time
import sys
import os
import concurrent.futures
from fastapi.testclient import TestClient

# Asegurar que el path incluya el directorio backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.config import settings

client = TestClient(app)

NUM_USERS = 50
REQUESTS_PER_USER = 5
EMAIL = settings.INITIAL_SUPERADMIN_EMAIL
PASSWORD = settings.INITIAL_SUPERADMIN_PASSWORD

def get_auth_token():
    """Obtiene un token JWT valido para el SuperAdmin."""
    try:
        response = client.post("/api/v1/auth/login/admin", json={
            "identifier": EMAIL,
            "password": PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        print(f"❌ Error Auth: {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print(f"❌ Excepción Auth: {e}")
        return None

def simulate_user_activity(token, user_id):
    """Simula actividad de usuario con el cliente en memoria."""
    headers = {"Authorization": f"Bearer {token}"}
    latencies = []
    errors = 0
    
    for _ in range(REQUESTS_PER_USER):
        try:
            # 1. Listar Tenants (Endpoint real)
            t0 = time.time()
            response = client.get("/api/v1/admin/", headers=headers)
            lat = time.time() - t0
            latencies.append(lat)
            
            if response.status_code != 200:
                errors += 1
                # print(f"Error {response.status_code}")

            # 2. Endpoint ligero (Health check o similar si existiera, o mismo endpoint)
            # Para variar, golpeamos el endpoint de 'me' si existe, o repetimos admin
            # client.get("/api/v1/auth/me", headers=headers) 
            
        except Exception:
            errors += 1
            
    return latencies, errors

def run_stress_test():
    print(f"🚀 Iniciando Stress Test (In-Memory FastAPI) con {NUM_USERS} usuarios concurrentes")
    print(f"🎯 Target: {EMAIL}")
    
    # 1. Autenticación
    token = get_auth_token()
    if not token:
        print("❌ No se pudo obtener token. Abortando test.")
        return

    print("✅ Autenticación exitosa. Token obtenido.")
    
    start_global = time.time()
    
    # 2. Ejecucion Concurrente
    # Nota: TestClient no es verdaderamente asíncrono con threads python standard debido al GIL 
    # y a que corre en el mismo proceso, pero sirve para medir overhead de frameworks y DB blocking.
    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_USERS) as executor:
        futures = [executor.submit(simulate_user_activity, token, i) for i in range(NUM_USERS)]
        results = [f.result() for f in futures]

    total_time = time.time() - start_global
    
    # 3. Analisis
    all_latencies = [lat for user_res in results for lat in user_res[0]]
    total_requests = len(all_latencies)
    avg_latency = sum(all_latencies) / len(all_latencies) if all_latencies else 0
    total_errors = sum(user_res[1] for user_res in results)
    
    # P95 Latency
    all_latencies.sort()
    p95_index = int(len(all_latencies) * 0.95)
    p95_latency = all_latencies[p95_index] if all_latencies else 0

    print(f"\n📊 Resultados del Test Intragrado:")
    print(f"Tiempo Total: {total_time:.2f}s")
    print(f"Requests Totales: {total_requests}")
    print(f"Latencia Promedio: {avg_latency*1000:.2f}ms")
    print(f"Latencia P95: {p95_latency*1000:.2f}ms")
    print(f"Errores: {total_errors}")

    if avg_latency < 0.5 and total_errors == 0:
        print("\n✅ PASSED: El sistema responde bajo 500ms promedio sin errores.")
    else:
        print("\n⚠️ WARNING: Latencia alta o errores detectados.")

if __name__ == "__main__":
    run_stress_test()
