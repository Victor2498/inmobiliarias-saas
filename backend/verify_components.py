
import asyncio
import os
import sys

# Ajustar path para imports
sys.path.append(os.getcwd())

from app.core.config import settings
from app.infrastructure.external.openai_service import OpenAIService
from app.infrastructure.external.whatsapp_client import whatsapp_client
from app.core.database import SessionLocal
from app.domain.models.tenant import WhatsAppInstanceModel

INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"
TEST_PHONE = "5493794352784" # El mismo numero del bot para auto-envio, o cambiar si se desea

async def test_openai():
    print("\n--- Probando OpenAI ---")
    try:
        print("Enviando prompt de prueba...")
        intent = await OpenAIService.detect_intent("Quiero alquilar un departamento en el centro")
        print(f"✅ Intención detectada: {intent}")
    except Exception as e:
        print(f"❌ Error OpenAI: {e}")

async def test_whatsapp():
    print("\n--- Probando Envío WhatsApp ---")
    db = SessionLocal()
    try:
        instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.instance_name == INSTANCE_NAME).first()
        if not instance:
            print(f"❌ La instancia {INSTANCE_NAME} no está en la BD.")
            return

        print(f"Instancia encontrada: {instance.instance_name} (ID: {instance.id})")
        
        # Enviar mensaje
        print(f"Enviando mensaje de prueba a {TEST_PHONE}...")
        success = await whatsapp_client.send_message(
            instance_name=INSTANCE_NAME,
            number=TEST_PHONE,  # Enviar al propio bot o definir otro envio
            text="🔔 Test de verificación de envío desde Backend"
        )
        
        if success:
            print("✅ Mensaje enviado correctamente (según API).")
        else:
            print("❌ El envío falló.")
            
    except Exception as e:
        print(f"❌ Excepción enviando WhatsApp: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_openai())
    loop.run_until_complete(test_whatsapp())
