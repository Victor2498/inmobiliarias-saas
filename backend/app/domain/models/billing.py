from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum, JSON
from sqlalchemy.orm import relationship
from app.domain.models.base import Base
import datetime
import enum

class LiquidationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class LiquidationModel(Base):
    __tablename__ = "liquidations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), index=True)
    period = Column(String, index=True) # Format: "MM/YYYY"
    due_date = Column(DateTime)
    total_amount = Column(Float)
    status = Column(String, default=LiquidationStatus.DRAFT, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True) # User ID who created it
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)
    
    # Relationships
    contract = relationship("ContractModel", back_populates="liquidations")
    items = relationship("LiquidationItemModel", back_populates="liquidation", cascade="all, delete-orphan")

class LiquidationItemModel(Base):
    __tablename__ = "liquidation_items"

    id = Column(Integer, primary_key=True, index=True)
    liquidation_id = Column(Integer, ForeignKey("liquidations.id"), index=True)
    concept_name = Column(String)
    description = Column(String, nullable=True)
    previous_value = Column(Float, default=0.0)
    current_value = Column(Float)
    adjustment_applied = Column(Boolean, default=False)
    adjustment_percentage = Column(Float, default=0.0)
    
    liquidation = relationship("LiquidationModel", back_populates="items")

class ContractConceptModel(Base):
    """
    Template concepts for a contract to auto-populate liquidations.
    """
    __tablename__ = "contract_concepts"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), index=True)
    concept_name = Column(String)
    amount = Column(Float)
    is_adjustable = Column(Boolean, default=False)
    adjustment_type = Column(String, default="NONE") # ICL, MANUAL, NONE
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    contract = relationship("ContractModel", back_populates="concepts")
