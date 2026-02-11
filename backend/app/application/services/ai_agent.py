from app.infrastructure.external.openai_service import OpenAIService
from sqlalchemy.orm import Session
from app.infrastructure.persistence.whatsapp_models import WhatsAppMessageModel
import logging

logger = logging.getLogger(__name__)

class AIAgentService:
    @staticmethod
    async def process_incoming_message(db: Session, message_id: int, content: str):
        """
        Procesa un mensaje recibido, detecta intencion y actualiza la base de datos.
        Disenado para ser ejecutado en BackgroundTasks.
        """
        try:
            # 1. Marcar como procesamiento en curso
            message = db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.id == message_id).first()
            if not message:
                logger.error(f"Mensaje {message_id} no encontrado para procesamiento de IA")
                return

            # 2. Llamada a OpenAI (Desacoplado)
            intent = await OpenAIService.detect_intent(content)
            
            # 3. Actualizar con resultado
            message.intent = intent
            message.processed = True
            db.commit()
            logger.info(f"IA: Intencion '{intent}' detectada para mensaje {message_id}")
            
        except Exception as e:
            logger.error(f"Error en AIAgentService al procesar mensaje {message_id}: {str(e)}")
            db.rollback()
