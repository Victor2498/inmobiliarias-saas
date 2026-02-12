import logging
from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, get_db
from app.api.deps import get_current_user
from app.application.services.payment_service import PaymentService

from typing import List
router = APIRouter()
logger = logging.getLogger(__name__)

from app.domain.schemas.payment import PaymentResponse

@router.get("/", response_model=List[PaymentResponse])
def list_payments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Lista todos los pagos recibidos"""
    service = PaymentService(db)
    return service.list_payments(skip=skip, limit=limit)

@router.get("/preference/charge/{charge_id}")
async def get_charge_preference(charge_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Genera una URL de pago para una liquidacion de alquiler"""
    service = PaymentService(db)
    init_point = service.get_charge_preference(charge_id)
    return {"init_point": init_point}

@router.post("/upgrade-plan")
async def create_upgrade_preference(new_plan: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Genera una URL de pago para que la inmobiliaria suba de plan SaaS"""
    service = PaymentService(db)
    init_point = service.create_upgrade_preference(current_user.tenant_id, new_plan)
    return {"init_point": init_point}

@router.post("/webhook")
async def mp_webhook(request: Request, background_tasks: BackgroundTasks):
    """Recibe notificaciones de pago de Mercado Pago"""
    data = await request.json()
    logger.info(f"MP Webhook received: {data}")
    
    if data.get("type") == "payment":
        payment_id = data.get("data", {}).get("id")
        if payment_id:
            background_tasks.add_task(process_payment, payment_id)
            
    return {"status": "ok"}

async def process_payment(payment_id: str):
    """Lógica de fondo para procesar el pago"""
    db = SessionLocal()
    try:
        service = PaymentService(db)
        await service.process_webhook_payment(payment_id)
    finally:
        db.close()

