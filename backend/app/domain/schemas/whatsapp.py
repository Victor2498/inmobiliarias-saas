from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class WhatsAppInstanceResponse(BaseModel):
    id: str
    tenant_id: str
    instance_name: str
    status: str
    qr_code: Optional[str] = None
    last_connected_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WhatsAppMessageResponse(BaseModel):
    id: int
    remote_jid: str
    from_me: bool
    content: str
    timestamp: datetime
    intent: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
