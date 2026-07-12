import uuid
from pydantic import BaseModel
from datetime import date, datetime

class FuelLogBase(BaseModel):
    refuel_date: date
    odometer: float
    gallons: float
    cost: float
    vehicle_id: uuid.UUID

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    refuel_date: date | None = None
    odometer: float | None = None
    gallons: float | None = None
    cost: float | None = None
    vehicle_id: uuid.UUID | None = None

class FuelLogResponse(FuelLogBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
