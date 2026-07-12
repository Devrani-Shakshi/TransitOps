import uuid
from pydantic import BaseModel
from datetime import datetime

class TripBase(BaseModel):
    trip_number: str
    origin: str
    destination: str
    status: str = "requested" # requested, dispatched, active, completed, cancelled
    start_time: datetime | None = None
    end_time: datetime | None = None
    estimated_distance: float | None = None
    actual_distance: float | None = None
    vehicle_id: uuid.UUID
    driver_id: uuid.UUID

class TripCreate(BaseModel):
    origin: str
    destination: str
    estimated_distance: float | None = None
    vehicle_id: uuid.UUID
    driver_id: uuid.UUID

class TripUpdate(BaseModel):
    status: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    actual_distance: float | None = None
    vehicle_id: uuid.UUID | None = None
    driver_id: uuid.UUID | None = None

class TripResponse(TripBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
