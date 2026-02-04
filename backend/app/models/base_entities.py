from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# Base Models with common fields
class TimeStampedModel(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AgencyBase(SQLModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    
class Agency(AgencyBase, TimeStampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    users: List["User"] = Relationship(back_populates="agency")
    properties: List["Property"] = Relationship(back_populates="agency")
    tenants: List["Tenant"] = Relationship(back_populates="agency")

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    
class User(UserBase, TimeStampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    agency_id: Optional[int] = Field(default=None, foreign_key="agency.id")
    agency: Optional[Agency] = Relationship(back_populates="users")

class TenantBase(SQLModel):
    full_name: str
    email: Optional[str] = None
    phone: str = Field(index=True) # WhatsApp number
    dni: Optional[str] = None
    address: Optional[str] = None
    
class Tenant(TenantBase, TimeStampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    unique_link_token: str = Field(unique=True, index=True) # For portal access
    agency_id: Optional[int] = Field(default=None, foreign_key="agency.id")
    agency: Optional[Agency] = Relationship(back_populates="tenants")
    contracts: List["Contract"] = Relationship(back_populates="tenant")

class PropertyBase(SQLModel):
    address: str
    city: str
    type: str # apartment, house, local
    status: str # available, rented, sold
    price: Optional[float] = None # Listing price
    owner_name: Optional[str] = None
    image_url: Optional[str] = None
    
class Property(PropertyBase, TimeStampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    agency_id: Optional[int] = Field(default=None, foreign_key="agency.id")
    agency: Optional[Agency] = Relationship(back_populates="properties")
    contracts: List["Contract"] = Relationship(back_populates="property")
