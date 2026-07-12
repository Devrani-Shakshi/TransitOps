import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime

class DriverBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    license_number: str
    status: str = "available" # available, on_trip, inactive, suspended
    is_active: bool = True

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    license_number: str | None = None
    status: str | None = None
    is_active: bool | None = None

class DriverResponse(DriverBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
