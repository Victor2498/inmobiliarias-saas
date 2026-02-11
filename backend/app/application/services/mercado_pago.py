import mercadopago
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MercadoPagoService:
    def __init__(self):
        if not settings.MP_ACCESS_TOKEN:
            logger.warning("MP_ACCESS_TOKEN no configurado")
        self.sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

    def create_charge_preference(self, charge_id: int, description: str, amount: float, email: str = ""):
        """
        Crea una preferencia para cobrar un alquiler/gasto a un inquilino.
        """
        preference_data = {
            "items": [
                {
                    "title": description,
                    "quantity": 1,
                    "unit_price": amount,
                }
            ],
            "payer": {
                "email": email
            },
            "external_reference": f"charge_{charge_id}",
            "notification_url": settings.MP_WEBHOOK_URL,
            "back_urls": {
                "success": f"{settings.MP_WEBHOOK_URL}/api/v1/payments/success",
                "failure": f"{settings.MP_WEBHOOK_URL}/api/v1/payments/failure",
            },
            "auto_return": "approved"
        }
        
        result = self.sdk.preference().create(preference_data)
        if result["status"] >= 400:
            logger.error(f"Error creando preferencia MP: {result}")
            return None
            
        return result["response"]

    def create_plan_upgrade_preference(self, tenant_id: str, plan_name: str, amount: float, email: str):
        """
        Crea una preferencia para que una inmobiliaria pague por un upgrade de plan.
        """
        preference_data = {
            "items": [
                {
                    "title": f"Upgrade a Plan {plan_name.capitalize()}",
                    "quantity": 1,
                    "unit_price": amount,
                }
            ],
            "payer": {
                "email": email
            },
            "external_reference": f"upgrade_{tenant_id}_{plan_name}",
            "notification_url": settings.MP_WEBHOOK_URL,
            "back_urls": {
                "success": f"{settings.MP_WEBHOOK_URL}/api/v1/payments/success",
                "failure": f"{settings.MP_WEBHOOK_URL}/api/v1/payments/failure",
            }
        }
        
        result = self.sdk.preference().create(preference_data)
        if result["status"] >= 400:
            logger.error(f"Error creando preferencia MP: {result}")
            return None
            
        return result["response"]
