from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.whatsapp_models import WhatsAppMessageModel, WhatsAppSessionModel
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
    
    if event == "MESSAGES_UPSERT":
        message_data = data.get("data", {})
        message = message_data.get("message", {})
        
        key = message_data.get("key", {})
        remote_jid = key.get("remoteJid")
        from_me = key.get("fromMe", False)
        
        content = message.get("conversation") or message.get("extendedTextMessage", {}).get("text")
        
        if content and not from_me:
            instance_name = data.get("instance")
            session = db.query(WhatsAppSessionModel).filter(WhatsAppSessionModel.instance_name == instance_name).first()
            
            if session:
                new_msg = WhatsAppMessageModel(
                    tenant_id=session.tenant_id,
                    remote_jid=remote_jid,
                    from_me=from_me,
                    content=content,
                    processed=False
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                
                # Delegar a la capa de Aplicacion asincronamente
                background_tasks.add_task(AIAgentService.process_incoming_message, db, new_msg.id, content)

    return {"status": "received"}
