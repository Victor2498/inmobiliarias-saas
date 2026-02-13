import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Asegurar que el path incluya la carpeta app para los imports
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.config import settings
from app.domain.models.base import Base
from app.domain.models.tenant import TenantModel, WhatsAppInstanceModel, AuditLogModel
from app.domain.models.user import UserModel, EmailVerificationTokenModel
from app.domain.models.business import PropertyModel, PersonModel, ContractModel, ChargeModel, PaymentModel
from app.domain.models.billing import LiquidationModel, LiquidationItemModel, ContractConceptModel
from app.domain.models.whatsapp import WhatsAppSessionModel, WhatsAppMessageModel

def reset_system():
    print("🔥 Iniciando RESET COMPLETO del sistema...")
    
    engine = create_engine(settings.get_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Identificar IDs a proteger
        superadmin_email = "superadmin@inmonea.com"
        master_tenant_id = "master"
        
        print(f"🛡️ Protegiendo SuperAdmin: {superadmin_email}")
        print(f"🛡️ Protegiendo Tenant: {master_tenant_id}")

        # 2. Limpieza de Tablas Operativas (Orden de integridad referencial inverso)
        print("🧹 Limpiando datos operativos...")
        
        # Facturación y Liquidaciones
        db.query(LiquidationItemModel).delete()
        db.query(LiquidationModel).delete()
        db.query(ContractConceptModel).delete()
        
        # Pagos y Cargos
        db.query(PaymentModel).delete()
        db.query(ChargeModel).delete()
        
        # Contratos
        db.query(ContractModel).delete()
        
        # Entidades base
        db.query(PropertyModel).delete()
        db.query(PersonModel).delete()
        
        # WhatsApp
        print("🧹 Limpiando historial de WhatsApp...")
        db.query(WhatsAppMessageModel).delete()
        db.query(WhatsAppSessionModel).delete()
        db.query(WhatsAppInstanceModel).delete()
        
        # Logs y Tokens
        db.query(AuditLogModel).delete()
        db.query(EmailVerificationTokenModel).delete()

        # 3. Usuarios (Excepto SuperAdmin)
        print("👤 Eliminando usuarios de prueba...")
        db.query(UserModel).filter(UserModel.email != superadmin_email).delete()
        
        # 4. Tenants (Excepto Master)
        print("📦 Eliminando inmobiliarias...")
        db.query(TenantModel).filter(TenantModel.id != master_tenant_id).delete()
        
        # 5. Commit Final
        db.commit()
        print("\n✨ RESET COMPLETADO EXITOSAMENTE.")
        print("👉 Solo el SuperAdmin y el Tenant maestro permanecen en el sistema.")
        
    except Exception as e:
        print(f"❌ ERROR durante el reset: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Confirmación final interna
    reset_system()
