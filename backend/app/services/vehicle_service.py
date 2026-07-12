import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.vehicle_repository import vehicle_repository
from app.models.vehicle import Vehicle
from app.core.exceptions import CoreException

class VehicleService:
    async def get_vehicle(self, db: AsyncSession, vehicle_id: uuid.UUID) -> Vehicle:
        vehicle = await vehicle_repository.get(db, vehicle_id)
        if not vehicle:
            raise CoreException("Vehicle not found", status_code=404)
        return vehicle

    async def create_vehicle(self, db: AsyncSession, *, license_plate: str, vin: str, make: str, model: str, year: int, mileage: float = 0.0) -> Vehicle:
        existing_plate = await vehicle_repository.get_by_license_plate(db, license_plate=license_plate)
        if existing_plate:
            raise CoreException("Vehicle with this license plate already exists", status_code=400)
        
        existing_vin = await vehicle_repository.get_by_vin(db, vin=vin)
        if existing_vin:
            raise CoreException("Vehicle with this VIN already exists", status_code=400)
        
        data = {
            "license_plate": license_plate,
            "vin": vin,
            "make": make,
            "model": model,
            "year": year,
            "mileage": mileage,
            "status": "active"
        }
        return await vehicle_repository.create(db, obj_in=data)

vehicle_service = VehicleService()
