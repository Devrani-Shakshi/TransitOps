from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.driver import Driver

class DriverRepository(BaseRepository[Driver]):
    def __init__(self):
        super().__init__(Driver)

    async def get_by_license_number(self, db: AsyncSession, *, license_number: str) -> Driver | None:
        result = await db.execute(select(Driver).filter(Driver.license_number == license_number, Driver.is_deleted == False))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Driver | None:
        result = await db.execute(select(Driver).filter(Driver.email == email, Driver.is_deleted == False))
        return result.scalars().first()

driver_repository = DriverRepository()
