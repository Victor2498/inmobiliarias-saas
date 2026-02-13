import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Ajustar imports
sys.path.append(os.getcwd())
from app.core.database import SessionLocal
from app.domain.models.tenant import WhatsAppInstanceModel
from app.domain.models.whatsapp import WhatsAppMessageModel

def check_messages():
    db = SessionLocal()
    try:
        instance_name = "tenant_a866a4c0-c219-4ec8"
        print(f"--- Buscando mensajes para: {instance_name} ---")
        
        # 1. Buscar la instancia
        instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.instance_name == instance_name).first()
        if not instance:
            print("❌ La instancia no existe en BD.")
            return

        tenant_id = instance.tenant_id
        print(f"Tenant ID: {tenant_id}")

        # 2. Listar ultimos mensajes
        # Intentar determinar el campo de fecha correcto
        order_field = WhatsAppMessageModel.timestamp if hasattr(WhatsAppMessageModel, 'timestamp') else WhatsAppMessageModel.created_at
        
        msgs = db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.tenant_id == tenant_id).order_by(order_field.desc()).limit(10).all()
        
        print(f"\n--- Últimos {len(msgs)} Mensajes ---")
        for m in msgs:
            status_icon = "✅" if m.processed else "⏳"
            timestamp = getattr(m, 'timestamp', getattr(m, 'created_at', 'N/A'))
            print(f"{status_icon} [{timestamp}] {m.remote_jid} ({'Bot' if m.from_me else 'User'}): {m.content}")
            print(f"   Intent: {m.intent} | Processed: {m.processed}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_messages()
