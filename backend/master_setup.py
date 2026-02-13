import httpx
import asyncio
import os
import sys
import uuid

# Ajustar path para imports
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.domain.models.tenant import WhatsAppInstanceModel, TenantModel
from app.core.config import settings

# CONFIGURACIÓN UNIFICADA
INSTANCE_NAME = "tenant_a866a4c0-c219-4ec8"
TENANT_ID = "a866a4c0-c219-4ec8"
EVO_URL = "http://evolution-api:8080"
HEADERS = {'apikey': '429683C4C977415CAAFCCE10F7D57E11'}
WEBHOOK_TOKEN = settings.SECRET_KEY # supersecretkeychangedinproduction

async def master_setup():
    print("--- 🚀 INICIANDO CONFIGURACIÓN DESDE CERO ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Limpieza en Evolution API
        print(f"🗑️ Eliminando instancia '{INSTANCE_NAME}' en Evolution (si existe)...")
        try:
            await client.delete(f"{EVO_URL}/instance/logout/{INSTANCE_NAME}", headers=HEADERS)
            await client.delete(f"{EVO_URL}/instance/delete/{INSTANCE_NAME}", headers=HEADERS)
        except:
            pass

        # 2. Limpieza en Base de Datos
        print("🧹 Limpiando registros antiguos en BD...")
        db = SessionLocal()
        try:
            db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == TENANT_ID).delete()
            db.commit()
            print("✅ BD Limpia.")
        except Exception as e:
            print(f"❌ Error limpiando BD: {e}")
            db.rollback()

        # 3. Crear Nueva Instancia
        print(f"🆕 Creando nueva instancia '{INSTANCE_NAME}'...")
        payload = {
            "instanceName": INSTANCE_NAME,
            "token": str(uuid.uuid4()),
            "integration": "WHATSAPP-BAILEYS"
        }
        resp = await client.post(f"{EVO_URL}/instance/create", headers=HEADERS, json=payload)
        if resp.status_code in [200, 201]:
            print("✅ Instancia creada en Evolution.")
        else:
            print(f"❌ Error creando instancia: {resp.text}")
            return

        # 4. Vincular en BD
        print("🔗 Vinculando instancia en BD local...")
        new_inst = WhatsAppInstanceModel(
            id=str(uuid.uuid4())[:8],
            tenant_id=TENANT_ID,
            instance_name=INSTANCE_NAME,
            status="CONNECTING",
            is_active=True
        )
        db.add(new_inst)
        db.commit()
        print(f"✅ Registro creado en BD (ID: {new_inst.id})")

        # 5. Configurar Webhook Estable
        # Usamos el nombre del servicio de Docker que es lo más estable
        webhook_url = f"http://sistema_inmobiliaria:8000/api/v1/webhooks/evolution?token={WEBHOOK_TOKEN}"
        print(f"🌐 Configurando Webhook en: {webhook_url}")
        
        webhook_data = {
            "url": webhook_url,
            "enabled": True,
            "webhookByEvents": False,
            "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "SEND_MESSAGE"]
        }
        webhook_resp = await client.post(f"{EVO_URL}/webhook/set/{INSTANCE_NAME}", headers=HEADERS, json=webhook_data)
        if webhook_resp.status_code in [200, 201]:
            print("✅ Webhook configurado correctamente.")
        else:
            print(f"❌ Error configurando webhook: {webhook_resp.text}")

        db.close()
        print("\n--- ✨ PROCESO COMPLETADO ---")
        print("1. Entra al sistema y escanea el código QR.")
        print("2. Envía un mensaje de prueba.")
        print("3. Si todo está bien, el bot responderá automáticamente.")

if __name__ == "__main__":
    asyncio.run(master_setup())
