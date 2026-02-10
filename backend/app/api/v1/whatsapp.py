from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.infrastructure.persistence.whatsapp_models import WhatsAppSessionModel
from app.infrastructure.external.evolution_service import EvolutionService
from app.api.deps import get_current_user, RoleChecker
from pydantic import BaseModel
from typing import List

router = APIRouter()
evo_service = EvolutionService()

class WhatsAppSessionResponse(BaseModel):
    id: int
    instance_name: str
    status: str
    tenant_id: str

    class Config:
        from_attributes = True

@router.get("/sessions", response_model=List[WhatsAppSessionResponse])
def get_sessions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(WhatsAppSessionModel).filter(WhatsAppSessionModel.tenant_id == current_user.tenant_id).all()

@router.post("/sessions/create")
async def create_session(instance_name: str, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["INMOBILIARIA_ADMIN"]))):
    # 1. Crear en Evolution API
    result = await evo_service.create_instance(instance_name)
    
    # 2. Guardar referencia local
    new_session = WhatsAppSessionModel(
        tenant_id=current_user.tenant_id,
        instance_name=instance_name,
        instance_id=result.get("instance", {}).get("instanceId")
    )
    db.add(new_session)
    db.commit()
    
    # 3. Configurar Webhook automáticamente (opcional pero recomendado)
    webhook_url = f"https://sistemainmobiliario.agentech.ar/api/v1/webhooks/evolution"
    await evo_service.set_webhook(instance_name, webhook_url)
    
    return result
