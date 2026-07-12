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
    
    # Frontend compatibility fields
    full_name: str | None = None
    contact_number: str | None = None
    license_category: str = "Commercial"
    license_expiry: str = "2028-12-31T00:00:00"
    emergency_contact: str = "555-0100"
    safety_score: float = 95.0

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        instance.full_name = f"{obj.first_name} {obj.last_name}"
        instance.contact_number = obj.phone
        
        # Format status to uppercase for frontend
        instance.status = (obj.status or "available").upper()
        return instance

    class Config:
        from_attributes = True

