import uuid
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Float, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle


class FuelLog(BaseModel):
    __tablename__ = "fuel_logs"

    refuel_date: Mapped[date] = mapped_column(Date, nullable=False)
    odometer: Mapped[float] = mapped_column(Float, nullable=False)
    gallons: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    
    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="fuel_logs")
