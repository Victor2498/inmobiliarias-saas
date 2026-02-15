"""
Lógica del cron diario: vencimientos (15 días) y ajustes de alquiler por ICL/IPC.
Envía notificaciones por WhatsApp vía Evolution API.
"""
import logging
import calendar
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session, joinedload

from app.domain.models.business import ContractModel
from app.domain.models.tenant import WhatsAppInstanceModel
from app.infrastructure.external.whatsapp_client import whatsapp_client
from app.application.services.rent_calculator_service import RentCalculatorService

logger = logging.getLogger(__name__)

# Plantillas de mensaje (variables: {nombre_inquilino}, {fecha_vencimiento}, {monto_actual}, {monto_viejo}, {monto_nuevo})
MSG_VENCIMIENTO = (
    "Hola {nombre_inquilino}, te recordamos que tu contrato de alquiler vence el {fecha_vencimiento}. "
    "Monto actual: ${monto_actual}. Por favor contacta a la inmobiliaria para renovación."
)
MSG_AJUSTE = (
    "Hola {nombre_inquilino}, te informamos el ajuste de tu alquiler. "
    "Monto anterior: ${monto_viejo}. Nuevo monto: ${monto_nuevo}. "
    "Queda efectivo según lo acordado en contrato."
)


def _add_months(d: date, months: int) -> date:
    """Suma N meses a una fecha (día se ajusta si no existe en el mes resultante)."""
    m = d.month - 1 + months
    y = d.year + m // 12
    m = m % 12 + 1
    last = calendar.monthrange(y, m)[1]
    day = min(d.day, last)
    return date(y, m, day)


def _safe_str(val, max_len=200):
    if val is None:
        return ""
    s = str(val).strip()[:max_len]
    return "".join(c for c in s if c.isprintable() or c in "\n\r")


async def run_daily_check(db: Session) -> dict:
    """
    Ejecuta Task A (aviso vencimiento 15 días) y Task B (ajustes ICL/IPC).
    Retorna resumen: { "expiration_sent": int, "adjustments_applied": int, "errors": list }
    """
    today = date.today()
    expiration_date = today + timedelta(days=15)
    result = {"expiration_sent": 0, "adjustments_applied": 0, "errors": []}
    calculator = RentCalculatorService(db)

    # --- Task A: Contratos que vencen en 15 días ---
    contracts_expiring = (
        db.query(ContractModel)
        .options(
            joinedload(ContractModel.person),
            joinedload(ContractModel.property),
        )
        .filter(
            ContractModel.status == "ACTIVE",
            ContractModel.end_date >= datetime.combine(expiration_date, datetime.min.time()),
            ContractModel.end_date < datetime.combine(expiration_date, datetime.min.time()) + timedelta(days=1),
        )
        .all()
    )

    for contract in contracts_expiring:
        if getattr(contract, "next_expiration_notification_sent", False):
            continue
        instance = db.query(WhatsAppInstanceModel).filter(
            WhatsAppInstanceModel.tenant_id == contract.tenant_id
        ).first()
        if not instance or not contract.person or not contract.person.phone:
            result["errors"].append(f"Contrato {contract.id}: sin instancia WhatsApp o sin teléfono del inquilino")
            continue
        nombre = _safe_str(contract.person.full_name or "Inquilino")
        fecha_venc = contract.end_date.strftime("%d/%m/%Y") if contract.end_date else ""
        monto = contract.current_rent or contract.monthly_rent or 0
        text = MSG_VENCIMIENTO.format(
            nombre_inquilino=nombre,
            fecha_vencimiento=fecha_venc,
            monto_actual=f"{monto:,.0f}".replace(",", "."),
        )
        try:
            # Número: quitar espacios y + ; Evolution suele esperar 54911...
            phone = (contract.person.phone or "").replace(" ", "").replace("+", "").strip()
            if not phone:
                continue
            await whatsapp_client.send_message(instance.instance_name, phone, text)
            contract.next_expiration_notification_sent = True
            result["expiration_sent"] += 1
        except Exception as e:
            result["errors"].append(f"Contrato {contract.id} WhatsApp: {e}")
            logger.exception("Error enviando aviso vencimiento contrato %s", contract.id)

    # --- Task B: Ajustes de alquiler (ciclo por adjustment_period) ---
    active_contracts = (
        db.query(ContractModel)
        .options(joinedload(ContractModel.person), joinedload(ContractModel.property))
        .filter(ContractModel.status == "ACTIVE", ContractModel.adjustment_type.in_(["ICL", "IPC"]))
        .all()
    )

    for contract in active_contracts:
        base_date = contract.last_adjustment_date if contract.last_adjustment_date else contract.start_date
        if not base_date:
            continue
        base_d = base_date.date() if hasattr(base_date, "date") else base_date
        freq = contract.adjustment_period or 12
        next_adjust = _add_months(base_d, freq)
        if next_adjust != today:
            continue

        calc = calculator.calculate_adjustment(contract.id, as_of_date=today)
        if not calc:
            result["errors"].append(f"Contrato {contract.id}: no se pudo calcular ajuste (índices?)")
            continue

        old_rent = float(contract.current_rent or contract.monthly_rent or 0)
        new_amount = calc["new_amount"]

        contract.current_rent = new_amount
        contract.last_adjustment_date = datetime.combine(today, datetime.min.time())
        contract.base_amount = new_amount  # Próximo ciclo usa este como base

        instance = db.query(WhatsAppInstanceModel).filter(
            WhatsAppInstanceModel.tenant_id == contract.tenant_id
        ).first()
        if instance and contract.person and contract.person.phone:
            nombre = _safe_str(contract.person.full_name or "Inquilino")
            text = MSG_AJUSTE.format(
                nombre_inquilino=nombre,
                monto_viejo=f"{old_rent:,.0f}".replace(",", "."),
                monto_nuevo=f"{new_amount:,.0f}".replace(",", "."),
            )
            try:
                phone = (contract.person.phone or "").replace(" ", "").replace("+", "").strip()
                if phone:
                    await whatsapp_client.send_message(instance.instance_name, phone, text)
            except Exception as e:
                result["errors"].append(f"Contrato {contract.id} WhatsApp ajuste: {e}")
                logger.exception("Error enviando aviso ajuste contrato %s", contract.id)

        result["adjustments_applied"] += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        result["errors"].append(f"Commit: {e}")

    return result
