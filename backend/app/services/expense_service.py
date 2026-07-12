import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.expense_repository import expense_repository
from app.models.expense import Expense
from app.core.exceptions import CoreException

class ExpenseService:
    async def create_expense(
        self, db: AsyncSession, *, category: str, description: str, amount: float, expense_date: date, vehicle_id: uuid.UUID | None = None
    ) -> Expense:
        if amount <= 0:
            raise CoreException("Expense amount must be greater than zero", status_code=400)
            
        data = {
            "category": category,
            "description": description,
            "amount": amount,
            "expense_date": expense_date,
            "vehicle_id": vehicle_id
        }
        return await expense_repository.create(db, obj_in=data)

expense_service = ExpenseService()
