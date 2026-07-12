import uuid
from pydantic import BaseModel
from datetime import date, datetime

class ExpenseBase(BaseModel):
    category: str
    description: str
    amount: float
    expense_date: date
    vehicle_id: uuid.UUID | None = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category: str | None = None
    description: str | None = None
    amount: float | None = None
    expense_date: date | None = None
    vehicle_id: uuid.UUID | None = None

class ExpenseResponse(ExpenseBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
