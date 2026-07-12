import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user, RoleChecker
from app.repositories.fuel_repository import fuel_repository
from app.schemas.fuel_log import FuelLogCreate, FuelLogUpdate, FuelLogResponse
from app.utils.response_envelope import success_response

router = APIRouter(dependencies=[Depends(RoleChecker(["admin", "financial_analyst"]))])

@router.get("")
@router.get("/")
async def list_fuel_logs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    logs = await fuel_repository.get_multi(db, skip=skip, limit=limit)
    data = [FuelLogResponse.model_validate(l).model_dump(mode="json") for l in logs]
    return success_response(data=data)

@router.get("/{id}")
async def get_fuel_log(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await fuel_repository.get(db, id)
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    return success_response(data=FuelLogResponse.model_validate(log).model_dump(mode="json"))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_fuel_log(log_in: FuelLogCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await fuel_repository.create(db, obj_in=log_in.model_dump())
    return success_response(data=FuelLogResponse.model_validate(log).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.put("/{id}")
async def update_fuel_log(id: uuid.UUID, log_in: FuelLogUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await fuel_repository.get(db, id)
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    updated = await fuel_repository.update(db, db_obj=log, obj_in=log_in.model_dump(exclude_unset=True))
    return success_response(data=FuelLogResponse.model_validate(updated).model_dump(mode="json"))

@router.delete("/{id}")
async def delete_fuel_log(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await fuel_repository.get(db, id)
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    await fuel_repository.soft_remove(db, id=id)
    return success_response(data={"message": "Fuel log soft-deleted successfully"})
