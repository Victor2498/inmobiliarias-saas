import openai
from app.core.config import settings

openai.api_key = settings.OPENAI_API_KEY

class OpenAIService:
    @staticmethod
    async def detect_intent(message_text: str):
        prompt = f"""
        Analiza el siguiente mensaje de un cliente de una inmobiliaria y detecta su intencion.
        Opciones de intencion: 
        - ALQUILER: El cliente busca alquilar una propiedad.
        - COMPRA: El cliente busca comprar una propiedad.
        - TASACION: El cliente quiere saber el valor de su propiedad.
        - CONSULTA_GENERAL: Cualquier otra duda.
        
        Mensaje: "{message_text}"
        
        Responde solo con la palabra clave de la intencion en MAYUSCULAS.
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error OpenAI: {e}")
            return "CONSULTA_GENERAL"
