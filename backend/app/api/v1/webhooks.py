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
        return {"status": "unauthorized"}

    data = await request.json()
    event = data.get("event")
    instance_name = data.get("instance")
    
    logger.info(f"🔔 WEBHOOK REBICEIDO - Event: {event} | Instance: {instance_name}")
    logger.info(f"📦 FULL DATA: {data}")
    
    if event == "MESSAGES_UPSERT":
        logger.info(f"DEBUG FULL PAYLOAD: {data}")
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
        
        logger.info(f"MSG DATA: JID={remote_jid} | FromMe={from_me} | Content={content} | Instance={data.get('instance')}")

        if content and not from_me:
            instance_name = data.get("instance")
            # Buscar la instancia vinculada a la inmobiliaria
            instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.instance_name == instance_name).first()
            
            if instance:
                logger.info(f"✅ Instancia encontrada en BD: {instance.id} (Tenant: {instance.tenant_id}). Guardando mensaje...")
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
                    logger.info(f"💾 Mensaje guardado ID: {new_msg.id}")
                    
                    # Delegar a la capa de Aplicacion asincronamente
                    background_tasks.add_task(AIAgentService.process_incoming_message, db, new_msg.id, content)
                except Exception as e:
                    logger.error(f"❌ Error guardando mensaje: {e}")
                    db.rollback()
            else:
                logger.error(f"❌ Instancia '{instance_name}' NO encontrada en BD local. Ver instancias registradas:")
                all_instances = db.query(WhatsAppInstanceModel).all()
                for i in all_instances:
                    logger.info(f"   BD Instance: '{i.instance_name}'")

    return {"status": "received"}
