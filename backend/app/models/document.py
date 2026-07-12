import uuid
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle
    from app.models.driver import Driver


class Document(BaseModel):
    __tablename__ = "documents"

    title: Mapped[str] = mapped_column(String(100), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False) # license, insurance, registration, permit
    document_number: Mapped[str] = mapped_column(String(50), nullable=False)
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    
    # Can belong to a vehicle
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=True)
    # Can belong to a driver
    driver_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id", ondelete="CASCADE"), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle | None"] = relationship("Vehicle", back_populates="documents")
    driver: Mapped["Driver | None"] = relationship("Driver", back_populates="documents")
