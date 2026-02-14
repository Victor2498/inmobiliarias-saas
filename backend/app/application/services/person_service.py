from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.models.business import PersonModel
from app.infrastructure.persistence.repository import BaseRepository
from app.domain.schemas.person import PersonCreate, PersonUpdate

class PersonService:
    def __init__(self, db: Session, tenant_id: Optional[str] = None):
        self.db = db
        self.repo = BaseRepository(PersonModel, db, tenant_id=tenant_id)

    def list_people(self, person_type: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[PersonModel]:
        query = self.repo._get_query()
        if person_type:
            query = query.filter(PersonModel.type == person_type)
        return query.offset(skip).limit(limit).all()

    def create_person(self, person_in: PersonCreate, tenant_id: Optional[str] = None) -> PersonModel:
        data = person_in.model_dump()
        if tenant_id:
            data["tenant_id"] = tenant_id
        return self.repo.create(data)

    def get_person(self, person_id: int) -> Optional[PersonModel]:
        return self.repo.get(person_id)

    def update_person(self, person_id: int, person_in: PersonUpdate) -> Optional[PersonModel]:
        db_obj = self.repo.get(person_id)
        if not db_obj:
            return None
        
        update_data = person_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete_person(self, person_id: int) -> bool:
        db_obj = self.repo.get(person_id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
