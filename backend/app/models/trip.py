import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle
    from app.models.driver import Driver


class Trip(BaseModel):
    __tablename__ = "trips"

    trip_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    origin: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="requested", nullable=False) # requested, dispatched, active, completed, cancelled
    
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    estimated_distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    driver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id"), nullable=False)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="trips")
    driver: Mapped["Driver"] = relationship("Driver", back_populates="trips")
