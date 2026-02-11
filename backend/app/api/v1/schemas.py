from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

class TenantLogin(BaseModel):
    nombre_inmobiliaria: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TenantResponse(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    is_active: bool
    whatsapp_enabled: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TenantCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    plan: Optional[str] = "lite"
    whatsapp_enabled: Optional[bool] = False

class TenantUpdate(BaseModel):
    is_active: Optional[bool] = None
    plan: Optional[str] = None
    whatsapp_enabled: Optional[bool] = None
    preferences: Optional[Dict[str, Any]] = None
