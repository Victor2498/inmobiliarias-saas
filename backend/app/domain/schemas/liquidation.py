from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class AdjustmentType(str, Enum):
    ICL = "ICL"
    MANUAL = "MANUAL"
    NONE = "NONE"

class LiquidationStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

# --- Liquidation Item Schemas ---

class LiquidationItemBase(BaseModel):
    concept_name: str
    description: Optional[str] = None
    current_value: float
    adjustment_applied: bool = False
    adjustment_percentage: float = 0.0

class LiquidationItemCreate(LiquidationItemBase):
    pass

class LiquidationItemUpdate(BaseModel):
    concept_name: Optional[str] = None
    current_value: Optional[float] = None
    adjustment_applied: Optional[bool] = None

class LiquidationItemResponse(LiquidationItemBase):
    id: int
    liquidation_id: int
    previous_value: float

    class Config:
        from_attributes = True

# --- Liquidation Header Schemas ---

class LiquidationBase(BaseModel):
    period: str
    due_date: datetime
    total_amount: float
    status: LiquidationStatus = LiquidationStatus.DRAFT

class LiquidationCreate(BaseModel):
    contract_id: int
    period: str
    due_date: datetime

class LiquidationUpdate(BaseModel):
    status: Optional[LiquidationStatus] = None
    due_date: Optional[datetime] = None
    items: Optional[List[LiquidationItemUpdate]] = None

class LiquidationResponse(LiquidationBase):
    id: int
    tenant_id: str
    contract_id: int
    created_at: datetime
    sent_at: Optional[datetime] = None
    items: List[LiquidationItemResponse] = []

    class Config:
        from_attributes = True
