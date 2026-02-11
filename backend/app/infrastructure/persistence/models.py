from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class TenantModel(Base):
    __tablename__ = "tenants"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True) # nombre_inmobiliaria
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan_id = Column(String, default="lite")
    is_active = Column(Boolean, default=True)
    plan = Column(String, default="lite") # lite, basic, premium
    whatsapp_enabled = Column(Boolean, default=False)
    preferences = Column(JSON, default={"theme": "light"})
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WhatsAppInstanceModel(Base):
    __tablename__ = "whatsapp_instances"
    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), unique=True)
    instance_name = Column(String, unique=True)
    status = Column(String, default="NOT_CONNECTED") # NOT_CONNECTED, QR_PENDING, CONNECTED, DISCONNECTED, ERROR
    qr_code = Column(String, nullable=True) # Almacena el QR en base64 o string
    last_connected_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="ASESOR") # SUPERADMIN, INMOBILIARIA_ADMIN, ASESOR
    is_active = Column(Boolean, default=True)

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
    status = Column(String, default="AVAILABLE")
