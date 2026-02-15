from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class OpenAIService:
    @staticmethod
    async def generate_response(message_text: str, agency_name: str, available_properties: list = None):
        """
        Genera una respuesta conversacional actuando como un asesor inmobiliario experto.
        """
        props_context = ""
        if available_properties:
            props_context = "Propiedades destacadas disponibles:\n"
            for p in available_properties[:3]:
                props_context += f"- {p.title} en {p.address} ({p.type}). Precio: {p.currency} {p.price:,.0f}\n"

        system_prompt = f"""
        Eres el asistente inteligente de la inmobiliaria "{agency_name}". 
        Tu objetivo es ser un Asesor Inmobiliario Senior: amable, profesional, proactivo y orientado a ventas.

        DIRECTRICES DE CONVERSACIÓN:
        1. SALUDO Y TONO: Saluda cordialmente y mantén un tono servicial.
        2. INTENCIONES CLAVE:
           - ALQUILER/COMPRA: Si el usuario busca algo, muestra interés, menciona si hay algo similar y haz preguntas de calificación (zona preferida, presupuesto, cantidad de ambientes).
           - TASACIÓN: Explica que realizamos tasaciones profesionales y pregunta si prefiere una visita presencial o una consulta inicial.
           - COSTOS/GASTOS: Sé transparente pero invita a una charla más profunda.
        3. PROACTIVIDAD: Si no sabes qué busca el usuario, ofrece opciones: "¿Estás buscando alquilar, comprar o quizás necesitas tasar una propiedad?"
        4. BREVEDAD: Usa párrafos cortos y emojis inmobiliarios (🏠, 📍, 💰, 🔑). WhatsApp es un medio rápido.
        5. CONTEXTO: Utiliza la siguiente información de propiedades si es relevante para responder:
        {props_context}

        Responde SIEMPRE en español, de forma fluida y natural. No parezcas un robot.
        """

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",  # Modelo más moderno y fluido
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message_text}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error OpenAI generate_response: {e}")
            return "¡Hola! Gracias por contactarnos. ¿Podrías decirme si estás interesado en alquilar, comprar o tasar una propiedad para poder asesorarte mejor? 🏠"

    @staticmethod
    async def detect_intent(message_text: str):
        # Mantenemos este para compatibilidad interna/logs si es necesario, pero simplificado
        prompt = f"Analiza: '{message_text}'. Responde SOLO UNA PALABRA: ALQUILER, COMPRA, TASACION o CONSULTA_GENERAL."
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=5
            )
            return response.choices[0].message.content.strip().upper()
        except:
            return "CONSULTA_GENERAL"
