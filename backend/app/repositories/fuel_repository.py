import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.fuel_log import FuelLog

class FuelRepository(BaseRepository[FuelLog]):
    def __init__(self):
        super().__init__(FuelLog)

    async def get_by_vehicle(self, db: AsyncSession, *, vehicle_id: uuid.UUID) -> list[FuelLog]:
        result = await db.execute(
            select(FuelLog).filter(
                FuelLog.vehicle_id == vehicle_id,
                FuelLog.is_deleted == False
            )
        )
        return list(result.scalars().all())

fuel_repository = FuelRepository()
