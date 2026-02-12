from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import RoleChecker, get_current_user
from app.domain.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from app.application.services.property_service import PropertyService
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[PropertyResponse])
def list_properties(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    service = PropertyService(db)
    return service.list_properties(skip=skip, limit=limit)

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PropertyService(db)
    prop = service.get_property(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return prop

@router.post("/", response_model=PropertyResponse)
def create_property(property_in: PropertyCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = PropertyService(db)
    return service.create_property(property_in)

@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(property_id: int, property_in: PropertyUpdate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = PropertyService(db)
    prop = service.update_property(property_id, property_in)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return prop

@router.delete("/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN"]))):
    service = PropertyService(db)
    if not service.delete_property(property_id):
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return {"message": "Propiedad eliminada correctamente"}
