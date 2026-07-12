import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user, RoleChecker
from app.repositories.expense_repository import expense_repository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.utils.response_envelope import success_response

router = APIRouter(dependencies=[Depends(RoleChecker(["admin", "financial_analyst"]))])

@router.get("")
@router.get("/")
async def list_expenses(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    expenses = await expense_repository.get_multi(db, skip=skip, limit=limit)
    data = [ExpenseResponse.model_validate(e).model_dump(mode="json") for e in expenses]
    return success_response(data=data)

@router.get("/{id}")
async def get_expense(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    expense = await expense_repository.get(db, id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return success_response(data=ExpenseResponse.model_validate(expense).model_dump(mode="json"))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_expense(exp_in: ExpenseCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    expense = await expense_repository.create(db, obj_in=exp_in.model_dump())
    return success_response(data=ExpenseResponse.model_validate(expense).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.put("/{id}")
async def update_expense(id: uuid.UUID, exp_in: ExpenseUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    expense = await expense_repository.get(db, id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    updated = await expense_repository.update(db, db_obj=expense, obj_in=exp_in.model_dump(exclude_unset=True))
    return success_response(data=ExpenseResponse.model_validate(updated).model_dump(mode="json"))

@router.delete("/{id}")
async def delete_expense(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    expense = await expense_repository.get(db, id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await expense_repository.soft_remove(db, id=id)
    return success_response(data={"message": "Expense soft-deleted successfully"})
