from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Integer
from .base import Base
import datetime

class TenantModel(Base):
    __tablename__ = "tenants"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    commercial_name = Column(String, nullable=True)  # Nombre comercial de la inmobiliaria
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan_id = Column(String, default="lite")
    is_active = Column(Boolean, default=True)
    plan = Column(String, default="lite")
    whatsapp_enabled = Column(Boolean, default=False)
    preferences = Column(JSON, default={"theme": "light"})
    status = Column(String, default="pending")
    last_billing_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WhatsAppInstanceModel(Base):
    __tablename__ = "whatsapp_instances"
    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), unique=True)
    instance_name = Column(String, unique=True)
    status = Column(String, default="NOT_CONNECTED")
    qr_code = Column(String, nullable=True)
    last_connected_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), index=True) # User model reference
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True, nullable=True)
    action = Column(String, index=True)
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

from sqlalchemy import Integer # Fix missing import in snippet
