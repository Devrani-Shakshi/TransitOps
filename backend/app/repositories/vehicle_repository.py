from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.vehicle import Vehicle

class VehicleRepository(BaseRepository[Vehicle]):
    def __init__(self):
        super().__init__(Vehicle)

    async def get_by_license_plate(self, db: AsyncSession, *, license_plate: str) -> Vehicle | None:
        result = await db.execute(select(Vehicle).filter(Vehicle.license_plate == license_plate, Vehicle.is_deleted == False))
        return result.scalars().first()

    async def get_by_vin(self, db: AsyncSession, *, vin: str) -> Vehicle | None:
        result = await db.execute(select(Vehicle).filter(Vehicle.vin == vin, Vehicle.is_deleted == False))
        return result.scalars().first()

vehicle_repository = VehicleRepository()
