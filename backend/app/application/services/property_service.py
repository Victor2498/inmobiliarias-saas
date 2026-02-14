from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.models.business import PropertyModel
from app.infrastructure.persistence.repository import BaseRepository
from app.domain.schemas.property import PropertyCreate, PropertyUpdate

class PropertyService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BaseRepository(PropertyModel, db)

    def list_properties(self, skip: int = 0, limit: int = 100) -> List[PropertyModel]:
        return self.repo.list(skip=skip, limit=limit)

    def get_property(self, property_id: int) -> Optional[PropertyModel]:
        return self.repo.get(property_id)

    def create_property(self, property_in: PropertyCreate, tenant_id: Optional[str] = None) -> PropertyModel:
        data = property_in.model_dump()
        if tenant_id:
            data["tenant_id"] = tenant_id
        return self.repo.create(data)

    def update_property(self, property_id: int, property_in: PropertyUpdate) -> Optional[PropertyModel]:
        db_obj = self.repo.get(property_id)
        if not db_obj:
            return None
        
        update_data = property_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete_property(self, property_id: int) -> bool:
        db_obj = self.repo.get(property_id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True

    def get_available_by_tenant(self, tenant_id: str, limit: int = 3) -> List[PropertyModel]:
        """Fetch available properties for a specific tenant."""
        return self.db.query(PropertyModel).filter(
            PropertyModel.tenant_id == tenant_id,
            PropertyModel.status == "AVAILABLE"
        ).limit(limit).all()
