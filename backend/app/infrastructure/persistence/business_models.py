import { Column, String, Float, Integer, ForeignKey, DateTime, Text, JSON } from "sqlalchemy";
from app.infrastructure.persistence.models import Base
import datetime

class PersonModel(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    full_name = Column(String, index=True)
    dni_cuit = Column(String)
    email = Column(String)
    phone = Column(String)
    type = Column(String) # INQUILINO, PROPIETARIO, GARANTE

class ContractModel(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    person_id = Column(Integer, ForeignKey("people.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    monthly_rent = Column(Float)
    adjustment_period = Column(Integer) # meses - para ILC
    last_adjustment_date = Column(DateTime)
    status = Column(String, default="ACTIVE")
