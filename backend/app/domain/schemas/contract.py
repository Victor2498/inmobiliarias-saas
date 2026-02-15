from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ContractBase(BaseModel):
    property_id: int
    person_id: int
    start_date: datetime
    end_date: datetime
    monthly_rent: float
    currency: str = "ARS"
    adjustment_type: str = "ICL"  # ICL, IPC, FIJO
    adjustment_period: int = 12
    status: str = "ACTIVE"

class ContractCreate(ContractBase):
    base_amount: Optional[float] = None  # Si no se envía, se usa monthly_rent al crear

class ContractUpdate(BaseModel):
    property_id: Optional[int] = None
    person_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    monthly_rent: Optional[float] = None
    current_rent: Optional[float] = None
    currency: Optional[str] = None
    adjustment_type: Optional[str] = None
    adjustment_period: Optional[int] = None
    base_amount: Optional[float] = None
    status: Optional[str] = None

class ContractResponse(ContractBase):
    id: int
    tenant_id: str
    current_rent: float
    base_amount: Optional[float] = None
    last_adjustment_date: Optional[datetime] = None
    next_expiration_notification_sent: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class ChargeResponse(BaseModel):
    id: int
    description: str
    amount: float
    due_date: datetime
    is_paid: bool
    contract_id: int

    model_config = ConfigDict(from_attributes=True)
