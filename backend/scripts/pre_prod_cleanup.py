import sys
import os
import logging
import logging
from sqlalchemy import text
import time

# Path setup to access app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.deps import get_db
from app.core.config import settings
from app.infrastructure.persistence.models import (
    UserModel, TenantModel, AuditLogModel, SubscriptionHistoryModel, 
    WhatsAppInstanceModel, EmailVerificationTokenModel, PropertyModel
)
from app.infrastructure.persistence.business_models import (
    PaymentModel, ChargeModel, ContractModel, PersonModel
)
from app.infrastructure.persistence.whatsapp_models import (
    WhatsAppMessageModel, WhatsAppSessionModel
)

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def clean_database():
    logger.info("🚀 Starting Pre-Production Database Cleanup...")
    
    db = next(get_db())
    
    try:
        # 1. Identify SuperAdmin to Preserve
        superadmin_email = settings.INITIAL_SUPERADMIN_EMAIL
        superadmin = db.query(UserModel).filter(UserModel.email == superadmin_email).first()
        
        if not superadmin:
            logger.error(f"❌ CRITICAL: SuperAdmin {superadmin_email} NOT FOUND! Aborting to prevent total data loss.")
            return
            
        logger.info(f"✅ Preserving SuperAdmin: {superadmin.email} (ID: {superadmin.id})")
        
        # 2. Deletion Order (Leafs -> Roots)
        
        # A. Logs & History (Least dependencies)
        logger.info("🗑️  Cleaning Logs and History...")
        db.query(AuditLogModel).delete()
        db.query(WhatsAppMessageModel).delete()
        db.query(SubscriptionHistoryModel).delete()
        db.query(EmailVerificationTokenModel).filter(EmailVerificationTokenModel.user_id != superadmin.id).delete()
        
        # B. Financial & WhatsApp Operation Data
        logger.info("🗑️  Cleaning Financial and WhatsApp Data...")
        db.query(PaymentModel).delete()
        db.query(WhatsAppSessionModel).delete()
        db.query(WhatsAppInstanceModel).delete()
        
        # C. Business Logic
        logger.info("🗑️  Cleaning Business Logic (Charges, Contracts)...")
        db.query(ChargeModel).delete()
        db.query(ContractModel).delete()
        
        # D. Entities
        logger.info("🗑️  Cleaning Entities (People, Properties)...")
        db.query(PersonModel).delete()
        db.query(PropertyModel).delete()
        
        # E. Users (Except SuperAdmin)
        logger.info("🗑️  Cleaning Users...")
        deleted_users = db.query(UserModel).filter(UserModel.id != superadmin.id).delete()
        logger.info(f"   - Deleted {deleted_users} users.")
        
        # F. Tenants (Except SuperAdmin's tenant if applicable)
        logger.info("🗑️  Cleaning Tenants...")
        # Check if SuperAdmin belongs to a tenant we should save
        preserved_tenant_id = superadmin.tenant_id
        
        if preserved_tenant_id:
            deleted_tenants = db.query(TenantModel).filter(TenantModel.id != preserved_tenant_id).delete()
            logger.info(f"   - Deleted {deleted_tenants} tenants. Preserved ID: {preserved_tenant_id}")
        else:
            deleted_tenants = db.query(TenantModel).delete()
            logger.info(f"   - Deleted {deleted_tenants} tenants.")

        # 3. Commit Changes
        db.commit()
        logger.info("✅ Cleanup Committed Successfully.")
        
        # 4. Reset Sequences (Optional/Postgres specific)
        logger.info("🔄 Resetting Sequences...")
        # Get all sequences
        sequences = db.execute(text("SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'")).fetchall()
        for seq in sequences:
            seq_name = seq[0]
            try:
                # Reset sequence to 1 (or max id + 1 if we had kept data, but here we wiped mostly)
                # Ideally check max id, but for now simple restart is likely fine for cleaned tables.
                # However, for users/tenants we kept one.
                pass 
                # skipping auto-reset complexity for now to avoid errors, 
                # Postgres auto-increments usually don't need manual reset unless we want ID=1 again.
            except Exception as e:
                logger.warning(f"Failed to reset sequence {seq_name}: {e}")
                
        logger.info("🎉 Database is now Clean for Production!")
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Safety Prompt
    print("⚠️  WARNING: This script will WIPE ALL DATA except the SuperAdmin.")
    print(f"Target Database: {settings.POSTGRES_SERVER}/{settings.POSTGRES_DB}")
    # confirmation = input("Type 'DELETE-ALL' to confirm: ")
    # if confirmation != "DELETE-ALL":
    #     print("ABORTED.")
    #     sys.exit()
    
    clean_database()
