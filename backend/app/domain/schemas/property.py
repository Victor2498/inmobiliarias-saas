from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict

class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    currency: str = "USD"
    address: str
    features: Optional[Dict] = None
    status: str = "AVAILABLE"

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    address: Optional[str] = None
    status: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    tenant_id: str

    model_config = ConfigDict(from_attributes=True)
