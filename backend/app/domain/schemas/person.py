from pydantic import BaseModel, ConfigDict
from typing import Optional

class PersonBase(BaseModel):
    full_name: str
    dni_cuit: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    type: str # INQUILINO, PROPIETARIO, GARANTE

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    full_name: Optional[str] = None
    dni_cuit: Optional[str] = None
    type: Optional[str] = None

class PersonResponse(PersonBase):
    id: int
    tenant_id: str

    model_config = ConfigDict(from_attributes=True)
