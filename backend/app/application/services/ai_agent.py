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
        logger.info(f"🚀 INICIO: Procesando mensaje ID {message_id} - Contenido: '{content[:50]}...'")
        try:
            # 1. Recuperar mensaje y validar plan
            from app.domain.models.tenant import TenantModel, WhatsAppInstanceModel
            
            message = db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.id == message_id).first()
            if not message:
                logger.error(f"❌ ERROR CRÍTICO: Mensaje {message_id} no encontrado en BD.")
                return

            tenant = db.query(TenantModel).filter(TenantModel.id == message.tenant_id).first()
            if not tenant:
                logger.warning(f"⚠️ Tenant {message.tenant_id} no encontrado. Continuando igual por ser testing.")
            elif tenant.plan not in ["basic", "premium"]:
                logger.warning(f"⛔ Plan restringido para Tenant {message.tenant_id}. Plan: {tenant.plan if tenant else 'N/A'}")
                message.processed = True
                message.intent = "PLAN_RESTRICTED"
                db.commit()
                return

            # 2. Llamada a OpenAI (Desacoplado)
            logger.info(f"🤖 Llamando a OpenAI para detectar intención...")
            intent = await OpenAIService.detect_intent(content)
            logger.info(f"🧠 Intención detectada: {intent}")
            
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
            
            # 4. Enviar respuesta via WhatsApp
            from app.infrastructure.external.whatsapp_client import whatsapp_client
            # Necesitamos el nombre de la instancia
            instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == message.tenant_id).first()
            
            if instance:
                logger.info(f"📤 Enviando respuesta a {message.remote_jid} vía instancia '{instance.instance_name}'...")
                success = await whatsapp_client.send_message(instance.instance_name, message.remote_jid, reply_text)
                if success:
                     logger.info(f"✅ RESPUESTA ENVIADA EXITOSAMENTE: {reply_text}")
                else:
                     logger.error(f"❌ FALLÓ EL ENVÍO DE RESPUESTA A EVOLUTION API")
            else:
                logger.error(f"❌ No se encontró instancia vinculada al tenant {message.tenant_id}")
            
        except Exception as e:
            logger.error(f"🔥 EXCEPCION en AIAgentService: {str(e)}", exc_info=True)
            db.rollback()
