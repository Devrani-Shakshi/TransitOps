import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.trip import Trip

class TripRepository(BaseRepository[Trip]):
    def __init__(self):
        super().__init__(Trip)

    async def get(self, db: AsyncSession, id: uuid.UUID) -> Trip | None:
        result = await db.execute(
            select(Trip)
            .options(selectinload(Trip.vehicle), selectinload(Trip.driver))
            .filter(Trip.id == id, Trip.is_deleted == False)
        )
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> list[Trip]:
        query = (
            select(Trip)
            .options(selectinload(Trip.vehicle), selectinload(Trip.driver))
            .filter(Trip.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())


    async def get_by_trip_number(self, db: AsyncSession, *, trip_number: str) -> Trip | None:
        result = await db.execute(select(Trip).filter(Trip.trip_number == trip_number, Trip.is_deleted == False))
        return result.scalars().first()

    async def get_active_trip_by_vehicle(self, db: AsyncSession, *, vehicle_id: uuid.UUID) -> Trip | None:
        result = await db.execute(
            select(Trip).filter(
                Trip.vehicle_id == vehicle_id,
                Trip.status.in_(["dispatched", "active"]),
                Trip.is_deleted == False
            )
        )
        return result.scalars().first()

    async def get_active_trip_by_driver(self, db: AsyncSession, *, driver_id: uuid.UUID) -> Trip | None:
        result = await db.execute(
            select(Trip).filter(
                Trip.driver_id == driver_id,
                Trip.status.in_(["dispatched", "active"]),
                Trip.is_deleted == False
            )
        )
        return result.scalars().first()

trip_repository = TripRepository()
