import asyncio
import httpx
import time
from unittest.mock import patch, AsyncMock, MagicMock
from app.main import app
from app.core.config import settings

# Mock de la sesion de base de datos
mock_db = MagicMock()
mock_session_entry = MagicMock()
mock_session_entry.tenant_id = "test_tenant"
mock_db.query.return_value.filter.return_value.first.return_value = mock_session_entry

# Mock de OpenAI
async def mock_ai_delay(*args, **kwargs):
    await asyncio.sleep(1.5) # Simular latencia de IA
    return "VENTA_PROPIEDAD"

@patch("app.api.v1.webhooks.get_db", return_value=mock_db)
@patch("app.application.services.ai_agent.OpenAIService.detect_intent", side_effect=mock_ai_delay)
@patch("app.api.v1.webhooks.AIAgentService.process_incoming_message", new_callable=AsyncMock)
async def run_stress_test(mock_process, mock_ai, mock_db_dep):
    client = httpx.AsyncClient(app=app, base_url="http://test")
    
    url = f"/api/v1/webhooks/evolution?token={settings.SECRET_KEY}"
    payload = {
        "event": "MESSAGES_UPSERT",
        "instance": "test_instance",
        "data": {
            "key": {"remoteJid": "123456@s.whatsapp.net", "fromMe": False},
            "message": {"conversation": "Hola, quiero ver una propiedad en Palermo"}
        }
    }

    n_requests = 30
    print(f"--- Stress Test Status: {n_requests} concurrent requests ---")
    
    start_total = time.perf_counter()
    
    tasks = []
    for _ in range(n_requests):
        tasks.append(client.post(url, json=payload))
    
    responses = await asyncio.gather(*tasks)
    
    end_total = time.perf_counter()
    
    # Analisis de resultados
    times = [r.elapsed.total_seconds() for r in responses]
    avg_time = sum(times) / len(times)
    
    print(f"Results:")
    print(f"- Total requests: {len(responses)}")
    print(f"- Total execution time (concurrent): {end_total - start_total:.4f}s")
    print(f"- Average response time (HTTP): {avg_time*1000:.2f}ms")
    print(f"- Successful responses (200 OK): {len([r for r in responses if r.status_code == 200])}")
    
    if avg_time < 0.2:
        print("SUCCESS: Webhook is highly reactive (background processing working).")
    else:
        print("WARNING: High response time. Check for synchronous blocks.")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
