import uuid
from pydantic import BaseModel, Field
from datetime import datetime

class VehicleBase(BaseModel):
    license_plate: str = Field(..., max_length=20)
    vin: str = Field(..., max_length=17)
    make: str
    model: str
    year: int
    status: str = "active" # active, maintenance, out_of_service
    mileage: float = 0.0
    fuel_type: str = "gasoline"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    license_plate: str | None = None
    vin: str | None = None
    make: str | None = None
    model: str | None = None
    year: int | None = None
    status: str | None = None
    mileage: float | None = None
    fuel_type: str | None = None

class VehicleResponse(VehicleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
