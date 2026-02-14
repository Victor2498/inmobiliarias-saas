from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.domain.schemas.person import PersonCreate, PersonResponse, PersonUpdate
from app.application.services.person_service import PersonService
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[PersonResponse])
def list_people(
    type: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    service = PersonService(db)
    return service.list_people(person_type=type, skip=skip, limit=limit)

@router.post("/", response_model=PersonResponse)
def create_person(person_in: PersonCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = PersonService(db)
    return service.create_person(person_in, tenant_id=current_user.tenant_id)

@router.get("/{person_id}", response_model=PersonResponse)
def get_person(person_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = PersonService(db)
    person = service.get_person(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return person

@router.put("/{person_id}", response_model=PersonResponse)
def update_person(person_id: int, person_in: PersonUpdate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    service = PersonService(db)
    person = service.update_person(person_id, person_in)
    if not person:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return person

@router.delete("/{person_id}")
def delete_person(person_id: int, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN"]))):
    service = PersonService(db)
    if not service.delete_person(person_id):
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return {"message": "Persona eliminada correctamente"}
