import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.expense import Expense

class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self):
        super().__init__(Expense)

    async def get_by_vehicle(self, db: AsyncSession, *, vehicle_id: uuid.UUID) -> list[Expense]:
        result = await db.execute(
            select(Expense).filter(
                Expense.vehicle_id == vehicle_id,
                Expense.is_deleted == False
            )
        )
        return list(result.scalars().all())

expense_repository = ExpenseRepository()
