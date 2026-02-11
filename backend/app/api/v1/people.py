from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.business_models import PersonModel
from app.infrastructure.persistence.repository import BaseRepository
from app.api.deps import get_current_user, RoleChecker
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class PersonBase(BaseModel):
    full_name: str
    dni_cuit: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    type: str # INQUILINO, PROPIETARIO, GARANTE

class PersonCreate(PersonBase):
    pass

class PersonResponse(PersonBase):
    id: int
    tenant_id: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PersonResponse])
def list_people(type: Optional[str] = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = BaseRepository(PersonModel, db)
    # El repo.list() ya filtra por tenant_id internamente
    if type:
        return db.query(PersonModel).filter(
            PersonModel.tenant_id == current_user.tenant_id,
            PersonModel.type == type
        ).all()
    return repo.list()

@router.post("/", response_model=PersonResponse)
def create_person(person_in: PersonCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN", "ASESOR"]))):
    repo = BaseRepository(PersonModel, db)
    return repo.create(person_in.dict())
