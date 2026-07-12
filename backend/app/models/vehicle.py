from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class Vehicle(BaseModel):
    __tablename__ = "vehicles"

    license_plate: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    vin: Mapped[str] = mapped_column(String(17), unique=True, index=True, nullable=False)
    make: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(50), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False) # active, maintenance, out_of_service
    mileage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(20), default="gasoline", nullable=False) # gasoline, diesel, electric, hybrid

    # Relationships
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="vehicle", cascade="all, delete-orphan")
    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="vehicle")
    maintenance_logs: Mapped[list["MaintenanceLog"]] = relationship("MaintenanceLog", back_populates="vehicle", cascade="all, delete-orphan")
    fuel_logs: Mapped[list["FuelLog"]] = relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
