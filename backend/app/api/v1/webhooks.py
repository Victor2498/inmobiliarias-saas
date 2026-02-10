from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.whatsapp_models import WhatsAppMessageModel, WhatsAppSessionModel
from app.infrastructure.external.openai_service import OpenAIService
import logging
import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

async def process_message_task(db: Session, message_id: int, content: str):
    # Detectar intención con OpenAI
    intent = await OpenAIService.detect_intent(content)
    
    # Actualizar mensaje en DB
    message = db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.id == message_id).first()
    if message:
        message.intent = intent
        message.processed = True
        db.commit()
        logger.info(f"Mensaje {message_id} procesado. Intención detectada: {intent}")

@router.post("/evolution")
async def evolution_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    data = await request.json()
    event = data.get("event")
    
    if event == "MESSAGES_UPSERT":
        message_data = data.get("data", {})
        message = message_data.get("message", {})
        
        # Extraer información básica
        key = message_data.get("key", {})
        remote_jid = key.get("remoteJid")
        from_me = key.get("fromMe", False)
        
        # Contenido del mensaje (texto simple)
        content = message.get("conversation") or message.get("extendedTextMessage", {}).get("text")
        
        if content and not from_me:
            # Buscar el tenant_id asociado a la instancia
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
                
                # Procesar en segundo plano con OpenAI
                background_tasks.add_task(process_message_task, db, new_msg.id, content)

    return {"status": "received"}
