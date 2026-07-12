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
    
    # Frontend compatibility fields
    registration_number: str | None = None
    model_name: str | None = None
    type: str | None = None
    max_load_capacity_kg: float = 15000.0
    odometer_km: float = 0.0
    acquisition_cost: float = 2500000.0
    insurance_expiry: str = "2026-12-31T00:00:00"
    fitness_cert_expiry: str = "2026-12-31T00:00:00"
    pollution_cert_expiry: str = "2026-12-31T00:00:00"

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        instance.registration_number = obj.license_plate
        instance.model_name = f"{obj.make} {obj.model}"
        
        # Map to frontend enum: TRUCK, VAN, CONTAINER
        ft = (obj.fuel_type or "").upper()
        if ft == "GASOLINE":
            instance.type = "TRUCK"
        elif ft == "HYBRID":
            instance.type = "VAN"
        else:
            instance.type = "CONTAINER"
            
        instance.odometer_km = obj.mileage
        
        # Format status to uppercase for frontend
        instance.status = (obj.status or "active").upper()
        if instance.status == "ACTIVE":
            instance.status = "AVAILABLE"
        elif instance.status == "MAINTENANCE":
            instance.status = "IN_SHOP"
        elif instance.status == "OUT_OF_SERVICE":
            instance.status = "RETIRED"
            
        return instance

    class Config:
        from_attributes = True

