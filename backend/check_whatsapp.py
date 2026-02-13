import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.database import SessionLocal
from app.domain.models.tenant import WhatsAppInstanceModel
from app.domain.models.whatsapp import WhatsAppMessageModel

db = SessionLocal()

print("=" * 50)
print("DIAGNÓSTICO DE WHATSAPP")
print("=" * 50)

# 1. Verificar instancias
instances = db.query(WhatsAppInstanceModel).all()
print(f"\n📱 Instancias de WhatsApp: {len(instances)}")
for i in instances:
    print(f"  - {i.instance_name} | Tenant: {i.tenant_id} | Status: {i.status}")

# 2. Verificar mensajes
messages = db.query(WhatsAppMessageModel).all()
print(f"\n💬 Mensajes totales: {len(messages)}")
if messages:
    print("\nÚltimos 3 mensajes:")
    for m in messages[-3:]:
        print(f"  - ID: {m.id} | Tenant: {m.tenant_id}")
        print(f"    Content: {m.content[:60]}...")
        print(f"    Processed: {m.processed} | Intent: {m.intent}")

db.close()
print("\n" + "=" * 50)
