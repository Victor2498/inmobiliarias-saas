from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from app.infrastructure.persistence.models import Base
import datetime

class WhatsAppSessionModel(Base):
    __tablename__ = "whatsapp_sessions"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    instance_name = Column(String, unique=True)
    instance_id = Column(String)
    status = Column(String, default="DISCONNECTED") # CONNECTED, DISCONNECTED, PAUSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WhatsAppMessageModel(Base):
    __tablename__ = "whatsapp_messages"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    remote_jid = Column(String, index=True)
    from_me = Column(Boolean, default=False)
    content = Column(Text)
    type = Column(String, default="text") # text, image, audio, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    intent = Column(String, nullable=True) # detectado por OpenAI
    processed = Column(Boolean, default=False)
