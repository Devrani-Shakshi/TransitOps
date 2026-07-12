import uuid
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle


class MaintenanceLog(BaseModel):
    __tablename__ = "maintenance_logs"

    service_type: Mapped[str] = mapped_column(String(100), nullable=False) # repair, routine, inspection
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    service_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False) # scheduled, in_progress, completed, cancelled
    
    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="maintenance_logs")
