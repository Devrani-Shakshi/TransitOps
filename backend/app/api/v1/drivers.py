import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user, RoleChecker
from app.repositories.driver_repository import driver_repository
from app.services.driver_service import driver_service
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.utils.response_envelope import success_response
from pydantic import BaseModel

class StatusUpdate(BaseModel):
    status: str


router = APIRouter(dependencies=[Depends(RoleChecker(["admin", "fleet_manager", "safety_officer"]))])

@router.get("")
@router.get("/")
async def list_drivers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    drivers = await driver_repository.get_multi(db, skip=skip, limit=limit)
    data = [DriverResponse.model_validate(d).model_dump(mode="json") for d in drivers]
    return success_response(data=data)

@router.get("/dispatch-pool")
async def get_dispatch_pool_drivers(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    drivers = await driver_repository.get_multi(db, skip=0, limit=100)
    data = [DriverResponse.model_validate(d).model_dump(mode="json") for d in drivers if getattr(d, "status", "AVAILABLE") == "AVAILABLE"]
    return success_response(data=data)

@router.patch("/{id}/status")
async def update_driver_status(id: uuid.UUID, status_in: StatusUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    driver = await driver_service.get_driver(db, id)
    updated = await driver_repository.update(db, db_obj=driver, obj_in={"status": status_in.status})
    return success_response(data=DriverResponse.model_validate(updated).model_dump(mode="json"))


@router.get("/{id}")
async def get_driver(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    driver = await driver_service.get_driver(db, id)
    return success_response(data=DriverResponse.model_validate(driver).model_dump(mode="json"))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_driver(drv_in: DriverCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    driver = await driver_service.create_driver(
        db,
        first_name=drv_in.first_name,
        last_name=drv_in.last_name,
        email=drv_in.email,
        phone=drv_in.phone,
        license_number=drv_in.license_number
    )
    return success_response(data=DriverResponse.model_validate(driver).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.put("/{id}")
async def update_driver(id: uuid.UUID, drv_in: DriverUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    driver = await driver_service.get_driver(db, id)
    updated = await driver_repository.update(db, db_obj=driver, obj_in=drv_in.model_dump(exclude_unset=True))
    return success_response(data=DriverResponse.model_validate(updated).model_dump(mode="json"))

@router.delete("/{id}")
async def delete_driver(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    driver = await driver_service.get_driver(db, id)
    await driver_repository.soft_remove(db, id=id)
    return success_response(data={"message": "Driver soft-deleted successfully"})
