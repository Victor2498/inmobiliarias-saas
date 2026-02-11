from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.infrastructure.persistence.models import TenantModel, UserModel
from app.infrastructure.persistence.business_models import ContractModel, PersonModel, ChargeModel
from app.application.services.contract_automation import ContractAutomationService
from app.infrastructure.security.tenant_context import set_current_tenant_id
import datetime

def test_automation():
    db = SessionLocal()
    try:
        # 1. Crear un tenant de prueba
        tenant_id = "test_auto_tenant"
        set_current_tenant_id(tenant_id)
        
        tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not tenant:
            tenant = TenantModel(id=tenant_id, name="Auto Inmo", email="auto@test.com", hashed_password="x")
            db.add(tenant)
            db.commit()

        # 2. Crear un contrato
        person = PersonModel(tenant_id=tenant_id, full_name="Inquilino Test", type="INQUILINO")
        db.add(person)
        db.commit()
        
        contract = ContractModel(
            tenant_id=tenant_id,
            person_id=person.id,
            monthly_rent=100000.0,
            current_rent=100000.0,
            status="ACTIVE",
            start_date=datetime.datetime.now()
        )
        db.add(contract)
        db.commit()

        # 3. Probar generación de cargos
        service = ContractAutomationService(db)
        print(f"Generating charges for 02/2024...")
        count = service.generate_monthly_charges(2, 2024)
        print(f"Charges generated: {count}")

        # 4. Verificar cargo en DB
        charge = db.query(ChargeModel).filter(ChargeModel.contract_id == contract.id).first()
        if charge:
            print(f"Charge found: {charge.description} - Amount: {charge.amount}")
        else:
            print("ERROR: Charge not found")

    finally:
        db.close()

if __name__ == "__main__":
    test_automation()
