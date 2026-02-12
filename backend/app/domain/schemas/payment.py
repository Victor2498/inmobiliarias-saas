from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class PaymentBase(BaseModel):
    amount: float
    payment_method: str
    transaction_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentCreate(PaymentBase):
    tenant_id: str
    charge_id: Optional[int] = None

class PaymentResponse(PaymentBase):
    id: int
    tenant_id: str
    charge_id: Optional[int] = None
    payment_date: datetime

    model_config = ConfigDict(from_attributes=True)
