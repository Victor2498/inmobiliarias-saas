
import csv
import io
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.domain.models.business import PaymentModel, ChargeModel, ContractModel, PersonModel, PropertyModel
from app.domain.models.billing import LiquidationModel
from datetime import datetime

class ReportsService:
    def __init__(self, db: Session):
        self.db = db

    def export_financial_movements(self, tenant_id: str):
        # 1. Fetch Incomes (Payments)
        payments = (
            self.db.query(PaymentModel)
            .join(ChargeModel)
            .join(ContractModel)
            .join(PersonModel) # Inquilino
            .filter(PaymentModel.tenant_id == tenant_id)
            .order_by(desc(PaymentModel.payment_date))
            .all()
        )

        # 2. Fetch Expenses (Liquidations) - Assuming Liquidations are "payments to owners"
        # For simplicity, we just list Liquidations as a separate section or mixed?
        # Let's create a unified list of "Movements"
        
        movements = []

        # Process Incomes
        for p in payments:
            movements.append({
                "fecha": p.payment_date.strftime("%Y-%m-%d %H:%M"),
                "tipo": "INGRESO",
                "concepto": f"Cobro: {p.charge.description}",
                "monto": p.amount,
                "entidad": f"{p.charge.contract.person.full_name} (Inquilino)",
                "metodo": p.payment_method,
                "estado": "Completado"
            })

        # Process Liquidations (Egresos)
        liquidations = (
            self.db.query(LiquidationModel)
            .join(ContractModel)
            .join(PropertyModel) # To get owner? Property usually links to owner but we might not have OwnerModel direct link here easily without checking schema
            .filter(LiquidationModel.tenant_id == tenant_id)
            .order_by(desc(LiquidationModel.created_at))
            .all()
        )

        for l in liquidations:
            # Assuming liquidation total is what is paid to owner
            movements.append({
                "fecha": l.created_at.strftime("%Y-%m-%d %H:%M"),
                "tipo": "EGRESO",
                "concepto": f"Liquidación #{l.id} - {l.period}",
                "monto": l.total_amount * -1, # Negative for expense
                "entidad": "Propietario", # Placeholder if owner name not readily available
                "metodo": "Transferencia/Efectivo",
                "estado": l.status
            })

        # Sort by date
        movements.sort(key=lambda x: x["fecha"], reverse=True)

        # Generate CSV
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["fecha", "tipo", "concepto", "monto", "entidad", "metodo", "estado"])
        writer.writeheader()
        for row in movements:
            writer.writerow(row)
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8-sig')), # utf-8-sig for Excel compatibility
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=movimientos_{tenant_id}_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
