from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.models import PropertyModel
from app.infrastructure.persistence.repository import BaseRepository
from app.api.deps import RoleChecker, get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    currency: str = "USD"
    address: str
    features: Optional[dict] = None
    status: str = "AVAILABLE"

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    address: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    tenant_id: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PropertyResponse])
def list_properties(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = BaseRepository(PropertyModel, db)
    return repo.list()

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = BaseRepository(PropertyModel, db)
    prop = repo.get(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return prop

@router.post("/", response_model=PropertyResponse)
def create_property(property_in: PropertyCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    repo = BaseRepository(PropertyModel, db)
    return repo.create(property_in.dict())

@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(property_id: int, property_in: PropertyUpdate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    repo = BaseRepository(PropertyModel, db)
    db_prop = repo.get(property_id)
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    update_data = property_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_prop, key, value)
    
    db.commit()
    db.refresh(db_prop)
    return db_prop

@router.delete("/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN"]))):
    repo = BaseRepository(PropertyModel, db)
    db_prop = repo.get(property_id)
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    db.delete(db_prop)
    db.commit()
    return {"message": "Propiedad eliminada correctamente"}
