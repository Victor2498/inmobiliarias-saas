from app.infrastructure.external.openai_service import OpenAIService
from sqlalchemy.orm import Session
from app.domain.models.whatsapp import WhatsAppMessageModel
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
            # 1. Recuperar mensaje y validar plan
            from app.domain.models.tenant import TenantModel
            
            message = db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.id == message_id).first()
            if not message:
                logger.error(f"Mensaje {message_id} no encontrado para procesamiento de IA")
                return

            tenant = db.query(TenantModel).filter(TenantModel.id == message.tenant_id).first()
            if not tenant or tenant.plan not in ["basic", "premium"]:
                logger.warning(f"Procesamiento IA cancelado: Tenant {message.tenant_id} no tiene plan activo (Plan: {tenant.plan if tenant else 'N/A'})")
                message.processed = True
                message.intent = "PLAN_RESTRICTED"
                db.commit()
                return

            # 2. Marcar como procesamiento en curso (Opcional, ya capturado arriba)

            # 3. Llamada a OpenAI (Desacoplado)
            # intent = await OpenAIService.detect_intent(content) # Deprecated simple intent
            
            # TODO: Mejorar esto con un agente real que genere respuestas completas
            # Por ahora, un mapeo simple basado en reglas para probar el flujo E2E
            intent = await OpenAIService.detect_intent(content)
            
            reply_text = "Gracias por tu mensaje. Un asesor se pondrá en contacto contigo a la brevedad."
            
            if intent == "ALQUILER":
                reply_text = "Hola! Veo que buscas alquilar. ¿Podrías indicarme qué zona te interesa y cuántos ambientes?"
            elif intent == "COMPRA":
                reply_text = "Hola! Para comprar, ¿qué presupuesto estás manejando y qué zona prefieres?"
            elif intent == "TASACION":
                reply_text = "Para realizar una tasación necesitamos saber la dirección de la propiedad y si es casa o departamento."
            
            # 3. Actualizar con resultado
            message.intent = intent
            message.processed = True
            db.commit()
            logger.info(f"IA: Intencion '{intent}' detectada para mensaje {message_id}. Respondiendo: {reply_text}")

            # 4. Enviar respuesta via WhatsApp
            from app.infrastructure.external.whatsapp_client import whatsapp_client
            # Necesitamos el nombre de la instancia
            instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == message.tenant_id).first()
            if instance:
                await whatsapp_client.send_message(instance.instance_name, message.remote_jid, reply_text)
            else:
                logger.error(f"No se encontró instancia para enviar respuesta al tenant {message.tenant_id}")
            
        except Exception as e:
            logger.error(f"Error en AIAgentService al procesar mensaje {message_id}: {str(e)}")
            db.rollback()
