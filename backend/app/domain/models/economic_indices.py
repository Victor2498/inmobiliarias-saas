from sqlalchemy import Column, Integer, Date, Numeric, DateTime
from .base import Base
import datetime


class EconomicIndexModel(Base):
    """Índices económicos diarios (ICL/IPC) para cálculo de ajustes de alquiler."""
    __tablename__ = "economic_indices"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    icl_value = Column(Numeric(18, 4), nullable=True)
    ipc_value = Column(Numeric(18, 4), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
