import uuid
from pydantic import BaseModel
from datetime import date, datetime

class MaintenanceBase(BaseModel):
    service_type: str
    description: str
    cost: float = 0.0
    service_date: date
    status: str = "scheduled" # scheduled, in_progress, completed, cancelled
    vehicle_id: uuid.UUID

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    service_type: str | None = None
    description: str | None = None
    cost: float | None = None
    service_date: date | None = None
    status: str | None = None
    vehicle_id: uuid.UUID | None = None

class MaintenanceResponse(MaintenanceBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
