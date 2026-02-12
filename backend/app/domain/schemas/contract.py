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
    adjustment_period: int = 12
    status: str = "ACTIVE"

class ContractCreate(ContractBase):
    pass

class ContractResponse(ContractBase):
    id: int
    tenant_id: str
    current_rent: float

    model_config = ConfigDict(from_attributes=True)

class ChargeResponse(BaseModel):
    id: int
    description: str
    amount: float
    due_date: datetime
    is_paid: bool
    contract_id: int

    model_config = ConfigDict(from_attributes=True)
