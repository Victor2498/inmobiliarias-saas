from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Float, Integer
from app.infrastructure.persistence.models import Base
import datetime

class PersonModel(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    full_name = Column(String, index=True)
    dni_cuit = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    type = Column(String) # INQUILINO, PROPIETARIO, GARANTE
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ContractModel(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    person_id = Column(Integer, ForeignKey("people.id")) # El inquilino principal
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    monthly_rent = Column(Float)
    currency = Column(String, default="ARS")
    current_rent = Column(Float) # El monto actual tras ajustes
    adjustment_period = Column(Integer) # meses
    last_adjustment_date = Column(DateTime)
    status = Column(String, default="ACTIVE") # ACTIVE, EXPIRED, TERMINATED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChargeModel(Base):
    __tablename__ = "charges"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), index=True)
    description = Column(String) # "Alquiler Enero 2024", "Expensas B", etc.
    amount = Column(Float)
    due_date = Column(DateTime)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PaymentModel(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    charge_id = Column(Integer, ForeignKey("charges.id"), index=True)
    amount = Column(Float)
    payment_method = Column(String) # MERCADOPAGO, TRANSFERENCIA, EFECTIVO
    transaction_id = Column(String, nullable=True) # ID externo (MP)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
