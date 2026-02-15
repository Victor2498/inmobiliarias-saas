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

            # 2. Generación de Respuesta Inteligente
            logger.info(f"🤖 Llamando a OpenAI para generar respuesta dinámica...")
            
            # Obtener contexto de propiedades
            from app.application.services.property_service import PropertyService
            prop_service = PropertyService(db)
            available_props = prop_service.get_available_by_tenant(message.tenant_id, limit=5)
            
            agency_name = tenant.name if tenant else "Inmonea"
            
            reply_text = await OpenAIService.generate_response(
                message_text=content,
                agency_name=agency_name,
                available_properties=available_props
            )
            
            # 2.5 Detección de intención para registro (opcional, para stats)
            intent = await OpenAIService.detect_intent(content)
            logger.info(f"🧠 Respuesta generada para intención {intent}")
            
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
