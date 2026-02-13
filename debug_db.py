import sys
import os
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.domain.models.tenant import TenantModel, WhatsAppInstanceModel
from app.domain.models.user import UserModel

db = SessionLocal()
try:
    # 1. Buscar el usuario Ivan
    user = db.query(UserModel).filter(UserModel.email == "ivan@mail.com").first()
    if user:
        print(f"--- USUARIO ---")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Tenant ID: {user.tenant_id}")
        print(f"Role: {user.role}")
        
        # 2. Buscar el Tenant
        tenant = db.query(TenantModel).filter(TenantModel.id == user.tenant_id).first()
        if tenant:
            print(f"\n--- TENANT ---")
            print(f"ID: {tenant.id}")
            print(f"Nombre: {tenant.name}")
            print(f"Plan: {tenant.plan}")
            print(f"Plan ID: {tenant.plan_id}")
            print(f"WhatsApp Enabled: {tenant.whatsapp_enabled}")
            
            # 3. Buscar la instancia de WhatsApp
            wa = db.query(WhatsAppInstanceModel).filter(WhatsAppInstanceModel.tenant_id == tenant.id).first()
            if wa:
                print(f"\n--- WHATSAPP INSTANCE ---")
                print(f"ID: {wa.id}")
                print(f"Instance Name: {wa.instance_name}")
                print(f"Status: {wa.status}")
                print(f"QR length: {len(wa.qr_code) if wa.qr_code else 0}")
            else:
                print("\n--- WHATSAPP ---")
                print("No hay instancia de WhatsApp registrada para este tenant.")
    else:
        print("Usuario ivan@mail.com no encontrado.")
finally:
    db.close()
