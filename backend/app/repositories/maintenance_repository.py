import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.maintenance_log import MaintenanceLog

class MaintenanceRepository(BaseRepository[MaintenanceLog]):
    def __init__(self):
        super().__init__(MaintenanceLog)

    async def get_by_vehicle(self, db: AsyncSession, *, vehicle_id: uuid.UUID) -> list[MaintenanceLog]:
        result = await db.execute(
            select(MaintenanceLog).filter(
                MaintenanceLog.vehicle_id == vehicle_id,
                MaintenanceLog.is_deleted == False
            )
        )
        return list(result.scalars().all())

maintenance_repository = MaintenanceRepository()
