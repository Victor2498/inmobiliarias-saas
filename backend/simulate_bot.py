import sys
import os
import asyncio
from unittest.mock import MagicMock, patch

# Add current directory to path
sys.path.append(os.getcwd())

# Import all models to ensure SQLAlchemy mappers are initialized correctly
from app.domain.models import user, tenant, business, billing, whatsapp

from app.core.database import SessionLocal
from app.domain.models.whatsapp import WhatsAppMessageModel
from app.domain.models.business import PropertyModel
from app.application.services.ai_agent import AIAgentService

async def simulate_bot_response():
    db = SessionLocal()
    tenant_id = "71c0b3b6-2598-42b9" # Inmobiliaria NEA
    
    # 1. Ensure at least one property exists for this tenant
    existing_prop = db.query(PropertyModel).filter(PropertyModel.tenant_id == tenant_id).first()
    if not existing_prop:
        print("Adding a test property...")
        test_prop = PropertyModel(
            title="Departamento de Lujo en Test",
            address="Av. Siempre Viva 123",
            price=150000,
            currency="USD",
            status="AVAILABLE",
            tenant_id=tenant_id
        )
        db.add(test_prop)
        db.commit()
    
    # 2. Mock a message
    msg = WhatsAppMessageModel(
        tenant_id=tenant_id,
        remote_jid="541122334455@s.whatsapp.net",
        content="Hola, estoy buscando un departamento para comprar",
        processed=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    print(f"Simulating response for message: '{msg.content}'")
    
    # 3. Patch WhatsApp client and OpenAI service to see only the logic
    with patch("app.infrastructure.external.openai_service.OpenAIService.detect_intent", return_value="COMPRA"):
        with patch("app.infrastructure.external.whatsapp_client.whatsapp_client.send_message") as mock_send:
            mock_send.return_value = True
            
            await AIAgentService.process_incoming_message(db, msg.id, msg.content)
            
            # Check what was "sent"
            if mock_send.called:
                instance, jid, text = mock_send.call_args[0]
                print("\n=== BOT RESPONSE ===\n")
                print(text)
                print("\n====================\n")
            else:
                print("Error: Send message was not called.")

    # Cleanup test message
    db.delete(msg)
    db.commit()
    db.close()

if __name__ == "__main__":
    asyncio.run(simulate_bot_response())
