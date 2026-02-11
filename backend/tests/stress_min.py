import asyncio
import httpx
import time
from unittest.mock import patch, AsyncMock, MagicMock
from app.main import app
from app.core.config import settings

m_db = MagicMock()
m_sess = MagicMock()
m_sess.tenant_id = "t1"
m_db.query.return_value.filter.return_value.first.return_value = m_sess

async def m_ai(*args, **kwargs):
    await asyncio.sleep(0.5)
    return "INTENT_OK"

@patch("app.api.v1.webhooks.get_db", return_value=m_db)
@patch("app.application.services.ai_agent.OpenAIService.detect_intent", side_effect=m_ai)
@patch("app.api.v1.webhooks.AIAgentService.process_incoming_message", new_callable=AsyncMock)
async def run_test(mock_p, mock_ai, mock_db):
    c = httpx.AsyncClient(app=app, base_url="http://t")
    u = f"/api/v1/webhooks/evolution?token={settings.SECRET_KEY}"
    p = {"event": "MESSAGES_UPSERT", "instance": "i1", "data": {"key": {"remoteJid": "j1", "fromMe": False}, "message": {"conversation": "hello"}}}
    
    start = time.perf_counter()
    resps = await asyncio.gather(*[c.post(u, json=p) for _ in range(50)])
    end = time.perf_counter()
    
    elapsed = [r.elapsed.total_seconds() for r in resps]
    print(f"Count: {len(resps)}")
    print(f"Total: {end - start:.4f}s")
    print(f"Avg: {sum(elapsed)/len(elapsed)*1000:.2f}ms")
    print(f"200s: {len([r for r in resps if r.status_code == 200])}")

if __name__ == "__main__":
    asyncio.run(run_test())
