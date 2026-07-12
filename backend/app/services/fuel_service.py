import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.fuel_repository import fuel_repository
from app.repositories.vehicle_repository import vehicle_repository
from app.models.fuel_log import FuelLog
from app.core.exceptions import CoreException

class FuelService:
    async def log_fuel(
        self, db: AsyncSession, *, vehicle_id: uuid.UUID, refuel_date: date, odometer: float, gallons: float, cost: float
    ) -> FuelLog:
        vehicle = await vehicle_repository.get(db, vehicle_id)
        if not vehicle:
            raise CoreException("Vehicle not found", status_code=404)
        
        if odometer < vehicle.mileage:
            raise CoreException(f"Odometer reading ({odometer}) cannot be less than vehicle current mileage ({vehicle.mileage})", status_code=400)
        
        # Update vehicle mileage to reflect fuel log odometer
        vehicle.mileage = odometer
        db.add(vehicle)

        data = {
            "vehicle_id": vehicle_id,
            "refuel_date": refuel_date,
            "odometer": odometer,
            "gallons": gallons,
            "cost": cost
        }
        log = await fuel_repository.create(db, obj_in=data)
        await db.commit()
        return log

fuel_service = FuelService()
