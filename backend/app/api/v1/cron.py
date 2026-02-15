"""
Endpoint de cron diario. Protegido por X-Cron-Secret o query token.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.application.services.daily_cron_service import run_daily_check

logger = logging.getLogger(__name__)

router = APIRouter()

def _cron_secret() -> str:
    return (settings.CRON_SECRET or settings.SECRET_KEY or "").strip()


def verify_cron(
    x_cron_secret: str | None = Header(None, alias="X-Cron-Secret"),
    token: str | None = Query(None, description="Token para cron (alternativa a header)"),
):
    secret = _cron_secret()
    if not secret:
        raise HTTPException(status_code=503, detail="Cron no configurado (CRON_SECRET)")
    provided = (x_cron_secret or token or "").strip()
    if provided != secret:
        raise HTTPException(status_code=403, detail="No autorizado")


@router.post("/daily-check")
async def daily_check(
    db: Session = Depends(get_db),
    _: None = Depends(verify_cron),
):
    """
    Ejecuta tareas diarias: avisos de vencimiento (15 días) y ajustes ICL/IPC.
    Llamar con header: X-Cron-Secret: <CRON_SECRET> o ?token=<CRON_SECRET>
    """
    try:
        result = await run_daily_check(db)
        return {
            "ok": True,
            "expiration_sent": result["expiration_sent"],
            "adjustments_applied": result["adjustments_applied"],
            "errors": result["errors"],
        }
    except Exception as e:
        logger.exception("Error en daily-check")
        raise HTTPException(status_code=500, detail=str(e))
