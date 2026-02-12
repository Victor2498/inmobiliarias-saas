"""
Script para verificar y arreglar el registro de la instancia en la Base de Datos
"""
import sys
import os

# Asegurar que el directorio actual está en el path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

print(f"Directorio de trabajo: {os.getcwd()}")
print(f"Sys Path: {sys.path}")

try:
    if not os.path.exists(os.path.join(current_dir, "app")):
        print("❌ ALERTA: No encuentro la carpeta 'app' en el directorio actual.")
        print("Contenido actual:", os.listdir(current_dir))

    from app.infrastructure.database.connection import SessionLocal
    from app.domain.models.tenant import WhatsAppInstanceModel, TenantModel
    from app.domain.models.whatsapp import WhatsAppMessageModel
    import uuid
except ImportError as e:
    print(f"❌ Error de Importación Crítico: {e}")
    print("Contenido del directorio:", os.listdir(current_dir))
    sys.exit(1)

def fix_db():
    try:
        db = SessionLocal()
    try:
        instance_name = "tenant_a866a4c0-c219-4ec8"
        tenant_id = "a866a4c0-c219-4ec8"
        
        print(f"--- Diagnóstico para {instance_name} ---")
        
        # 1. Buscar si existe la instancia en DB
        instance = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.instance_name == instance_name).first()
        
        if instance:
            print(f"✅ La instancia existe en la BD. ID: {instance.id}, Status: {instance.status}")
        else:
            print("❌ La instancia NO existe en la BD.")
            
            # 2. Verificar que el tenant exista
            tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
            if not tenant:
                print(f"❌ El Tenant {tenant_id} tampoco existe. Algo está mal con los IDs.")
                return

            print(f"✅ El Tenant existe: {tenant.name} (Plan: {tenant.plan})")
            
            # 3. Crear el registro faltante
            print("🛠️ Creando registro de instancia en BD...")
            new_instance = WhatsAppInstanceModel(
                id=str(uuid.uuid4())[:8],
                tenant_id=tenant_id,
                instance_name=instance_name,
                status="CONNECTED",
                is_active=True
            )
            db.add(new_instance)
            db.commit()
            print("✅ Registro creado exitosamente.")

        # 4. Ver si llegaron mensajes (aunque no se procesaron)
        print("\n--- Auditar Mensajes ---")
        msgs = db.query(WhatsAppMessageModel).filter(WhatsAppMessageModel.tenant_id == tenant_id).order_by(WhatsAppMessageModel.created_at.desc()).limit(5).all()
        if msgs:
            print(f"Últimos {len(msgs)} mensajes guardados:")
            for m in msgs:
                print(f" - [{m.created_at}] FromMe: {m.from_me} | Content: {m.content[:30]}... | Processed: {m.processed} | Intent: {m.intent}")
        else:
            print("⚠️ No hay mensajes guardados en la BD para este tenant.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_db()
