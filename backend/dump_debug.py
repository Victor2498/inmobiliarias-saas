
import os
import sys
# Ajustar path para imports
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.domain.models.whatsapp import WhatsAppMessageModel
from app.domain.models.tenant import WhatsAppInstanceModel

def dump_all():
    db = SessionLocal()
    try:
        print("--- Listando TODAS las instancias en BD ---")
        instances = db.query(WhatsAppInstanceModel).all()
        for i in instances:
            print(f"ID: {i.id} | Name: {i.instance_name} | Tenant: {i.tenant_id}")
            
        print("\n--- Listando ÚLTIMOS 20 Mensajes (Cualquier Tenant) ---")
        msgs = db.query(WhatsAppMessageModel).order_by(WhatsAppMessageModel.id.desc()).limit(20).all()
        for m in msgs:
            print(f"ID: {m.id} | Tenant: {m.tenant_id} | FromMe: {m.from_me} | Content: {m.content[:50]}...")
            print(f"   JID: {m.remote_jid} | Processed: {m.processed} | Intent: {m.intent}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    dump_all()
