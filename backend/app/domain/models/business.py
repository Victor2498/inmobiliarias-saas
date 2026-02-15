from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Float, Integer
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class PropertyModel(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    title = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    currency = Column(String, default="USD")
    address = Column(String)
    features = Column(JSON)
    status = Column(String, default="AVAILABLE", index=True)
    
    contracts = relationship("ContractModel", back_populates="property")

class PersonModel(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    full_name = Column(String, index=True)
    dni_cuit = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    contracts = relationship("ContractModel", back_populates="person")

class ContractModel(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), index=True)
    person_id = Column(Integer, ForeignKey("people.id"), index=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    monthly_rent = Column(Float)
    currency = Column(String, default="ARS")
    current_rent = Column(Float)
    base_amount = Column(Float, nullable=True)  # Monto base para ajuste por índice
    adjustment_type = Column(String, default="ICL", index=True)  # ICL, IPC, FIJO
    adjustment_period = Column(Integer)  # Frecuencia en meses
    last_adjustment_date = Column(DateTime)
    next_expiration_notification_sent = Column(Boolean, default=False)
    status = Column(String, default="ACTIVE", index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    property = relationship("PropertyModel", back_populates="contracts")
    person = relationship("PersonModel", back_populates="contracts")
    charges = relationship("ChargeModel", back_populates="contract")
    
    # New relationships for Liquidations module
    liquidations = relationship("LiquidationModel", back_populates="contract")
    concepts = relationship("ContractConceptModel", back_populates="contract")

class ChargeModel(Base):
    __tablename__ = "charges"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), index=True)
    description = Column(String)
    amount = Column(Float)
    due_date = Column(DateTime, index=True)
    is_paid = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    contract = relationship("ContractModel", back_populates="charges")
    payments = relationship("PaymentModel", back_populates="charge")

class PaymentModel(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    charge_id = Column(Integer, ForeignKey("charges.id"), index=True)
    amount = Column(Float)
    payment_method = Column(String)
    transaction_id = Column(String, nullable=True)
    payment_info = Column(JSON, nullable=True)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    charge = relationship("ChargeModel", back_populates="payments")
