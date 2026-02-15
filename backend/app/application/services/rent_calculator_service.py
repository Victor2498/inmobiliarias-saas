"""
Servicio de cálculo de ajuste de alquiler por índices ICL/IPC.
"""
import logging
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.domain.models.business import ContractModel
from app.domain.models.economic_indices import EconomicIndexModel

logger = logging.getLogger(__name__)


def _get_index_for_date(db: Session, index_date: date, index_type: str) -> Optional[float]:
    """
    Obtiene el valor del índice (ICL o IPC) para una fecha.
    Si no existe la fecha exacta, usa el último valor disponible anterior.
    """
    col = EconomicIndexModel.icl_value if index_type == "ICL" else EconomicIndexModel.ipc_value
    row = (
        db.query(EconomicIndexModel)
        .filter(and_(EconomicIndexModel.date <= index_date, col.isnot(None)))
        .order_by(EconomicIndexModel.date.desc())
        .first()
    )
    if not row:
        return None
    val = getattr(row, "icl_value" if index_type == "ICL" else "ipc_value")
    return float(val) if val is not None else None


class RentCalculatorService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_adjustment(
        self, contract_id: int, as_of_date: Optional[date] = None
    ) -> Optional[dict]:
        """
        Calcula el nuevo monto de alquiler según índice (ICL o IPC).
        Fórmula: nuevo_monto = base_amount * (índice_actual / índice_base).

        Returns:
            {"new_amount": float, "percentage_increase": float} o None si no aplica/error.
        """
        contract = (
            self.db.query(ContractModel)
            .options(
                joinedload(ContractModel.person),
                joinedload(ContractModel.property),
            )
            .filter(ContractModel.id == contract_id)
            .first()
        )
        if not contract:
            return None

        if contract.adjustment_type == "FIJO":
            current = float(contract.current_rent or contract.monthly_rent or 0)
            return {"new_amount": current, "percentage_increase": 0.0}

        if contract.adjustment_type not in ("ICL", "IPC"):
            logger.warning(f"Contrato {contract_id} con adjustment_type={contract.adjustment_type}, tratando como FIJO")
            current = float(contract.current_rent or contract.monthly_rent or 0)
            return {"new_amount": current, "percentage_increase": 0.0}

        base_amount = contract.base_amount if contract.base_amount is not None else (contract.monthly_rent or 0)
        if base_amount <= 0:
            return None

        target_date = as_of_date or date.today()
        base_date = None
        if contract.last_adjustment_date:
            d = contract.last_adjustment_date
            base_date = d.date() if hasattr(d, "date") else d
        else:
            d = contract.start_date
            base_date = d.date() if d and hasattr(d, "date") else (d if isinstance(d, date) else None)

        if not base_date:
            return None

        index_base = _get_index_for_date(self.db, base_date, contract.adjustment_type)
        index_current = _get_index_for_date(self.db, target_date, contract.adjustment_type)

        if index_base is None or index_current is None or index_base <= 0:
            logger.warning(
                f"Índices no disponibles: contrato={contract_id}, base_date={base_date}, "
                f"index_base={index_base}, index_current={index_current}"
            )
            return None

        new_amount = round(base_amount * (index_current / index_base), 2)
        percentage_increase = round(((new_amount / base_amount) - 1) * 100, 2)

        return {
            "new_amount": new_amount,
            "percentage_increase": percentage_increase,
        }
