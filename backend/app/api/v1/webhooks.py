from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domain.models.whatsapp import WhatsAppMessageModel
from app.domain.models.tenant import WhatsAppInstanceModel
from app.infrastructure.external.openai_service import OpenAIService
import logging
import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

from app.application.services.ai_agent import AIAgentService
from app.core.config import settings

async def audit_webhook_token(request: Request):
    token = request.query_params.get("token")
    if token != settings.SECRET_KEY:
        logger.warning(f"Webhook unauthorized access attempt from {request.client.host}")
        return False
    return True

@router.post("/evolution")
async def evolution_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not await audit_webhook_token(request):
        print(f"⚠️ WEBHOOK UNAUTHORIZED: {request.query_params.get('token')}")
        return {"status": "unauthorized"}

    data = await request.json()
    event = data.get("event")
    instance_name = data.get("instance")
    
    print(f"🔔 WEBHOOK RECIBIDO - Event: {event} | Instance: {instance_name}")
    
    if event == "MESSAGES_UPSERT":
        print(f"📦 DATA: {data}")
        message_data = data.get("data", {})
        key = message_data.get("key", {})
        message = message_data.get("message", {})
        
        remote_jid = key.get("remoteJid")
        from_me = key.get("fromMe", False)
        
        # Estructura Evolution v2 a veces varia
        content = (
            message.get("conversation") or 
            message.get("extendedTextMessage", {}).get("text") or
            message.get("imageMessage", {}).get("caption")
        )
        
        print(f"💬 MSG: JID={remote_jid} | FromMe={from_me} | Content='{content}'")

        if content and not from_me:
            # Buscar la instancia vinculada a la inmobiliaria
            instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.instance_name == instance_name).first()
            
            if instance:
                print(f"✅ Instancia coincide: {instance.id}. Guardando...")
                try:
                    new_msg = WhatsAppMessageModel(
                        tenant_id=instance.tenant_id,
                        remote_jid=remote_jid,
                        from_me=from_me,
                        content=content,
                        processed=False
                    )
                    db.add(new_msg)
                    db.commit()
                    db.refresh(new_msg)
                    print(f"💾 Guardado con éxito. ID: {new_msg.id}")
                    
                    # Delegar a la capa de Aplicacion asincronamente
                    background_tasks.add_task(AIAgentService.process_incoming_message, db, new_msg.id, content)
                except Exception as e:
                    print(f"❌ Error al guardar en BD: {e}")
                    db.rollback()
            else:
                print(f"❌ ERROR: Instancia '{instance_name}' no existe en nuestra BD.")
                # Loggear lo que tenemos para comparar
                insts = db.query(WhatsAppInstanceModel).all()
                for i in insts:
                    print(f"   - BD registra: '{i.instance_name}'")

    return {"status": "received"}
