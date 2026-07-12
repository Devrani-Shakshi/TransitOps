import uuid
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle


class Expense(BaseModel):
    __tablename__ = "expenses"

    category: Mapped[str] = mapped_column(String(50), nullable=False) # toll, parking, insurance, fuel, maintenance, salary, other
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle | None"] = relationship("Vehicle", back_populates="expenses")
