import uuid
from pydantic import BaseModel
from datetime import datetime
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse

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
    
    # Relationships
    vehicle: VehicleResponse | None = None
    driver: DriverResponse | None = None
    
    # Frontend compatibility fields
    trip_code: str | None = None
    source: str | None = None
    cargo_weight_kg: float = 5000.0
    planned_distance_km: float = 0.0
    actual_distance_km: float = 0.0
    start_odometer: float = 125000.0
    final_odometer: float = 125200.0
    fuel_consumed_l: float = 45.0
    revenue: float = 350.0
    dispatched_at: datetime | None = None
    completed_at: datetime | None = None

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        instance.trip_code = obj.trip_number
        instance.source = obj.origin
        instance.planned_distance_km = obj.estimated_distance or 0.0
        instance.actual_distance_km = obj.actual_distance or 0.0
        instance.dispatched_at = obj.start_time
        instance.completed_at = obj.end_time
        
        # Upper case status
        instance.status = (obj.status or "requested").upper()
        return instance

    class Config:
        from_attributes = True

