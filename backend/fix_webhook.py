import os
import sys
import asyncio

sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.database import SessionLocal
from app.domain.models.tenant import WhatsAppInstanceModel
from app.infrastructure.external.whatsapp_client import whatsapp_client
from app.core.config import settings

async def check_and_fix_webhook():
    db = SessionLocal()
    
    try:
        # Obtener la instancia
        instance = db.query(WhatsAppInstanceModel).first()
        
        if not instance:
            print("❌ No hay instancias de WhatsApp configuradas")
            return
        
        print(f"📱 Instancia encontrada: {instance.instance_name}")
        print(f"🔗 URL de Evolution API: {settings.EVOLUTION_API_URL}")
        
        # Configurar webhook
        if settings.WEBHOOK_URL_OVERRIDE:
            webhook_url = f"{settings.WEBHOOK_URL_OVERRIDE.rstrip('/')}?token={settings.SECRET_KEY}"
        else:
            # URL por defecto
            webhook_url = f"https://sistemainmobiliario.agentech.ar/api/v1/webhooks/evolution?token={settings.SECRET_KEY}"
        
        print(f"🎯 Configurando webhook: {webhook_url.split('?')[0]}...")
        
        webhook_data = {
            "webhook": {
                "enabled": True,
                "url": webhook_url,
                "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "SEND_MESSAGE"]
            }
        }
        
        result = await whatsapp_client._safe_request("POST", f"/webhook/set/{instance.instance_name}", json=webhook_data)
        
        if result:
            print("✅ Webhook configurado exitosamente")
            print(f"📋 Respuesta: {result}")
        else:
            print("❌ Error al configurar webhook")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(check_and_fix_webhook())
