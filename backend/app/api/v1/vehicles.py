import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.repositories.vehicle_repository import vehicle_repository
from app.services.vehicle_service import vehicle_service
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.utils.response_envelope import success_response, error_response

router = APIRouter()

@router.get("/")
async def list_vehicles(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    vehicles = await vehicle_repository.get_multi(db, skip=skip, limit=limit)
    data = [VehicleResponse.model_validate(v).model_dump(mode="json") for v in vehicles]
    return success_response(data=data)

@router.get("/{id}")
async def get_vehicle(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    vehicle = await vehicle_service.get_vehicle(db, id)
    return success_response(data=VehicleResponse.model_validate(vehicle).model_dump(mode="json"))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_vehicle(veh_in: VehicleCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    vehicle = await vehicle_service.create_vehicle(
        db,
        license_plate=veh_in.license_plate,
        vin=veh_in.vin,
        make=veh_in.make,
        model=veh_in.model,
        year=veh_in.year,
        mileage=veh_in.mileage
    )
    return success_response(data=VehicleResponse.model_validate(vehicle).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.put("/{id}")
async def update_vehicle(id: uuid.UUID, veh_in: VehicleUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    vehicle = await vehicle_service.get_vehicle(db, id)
    updated = await vehicle_repository.update(db, db_obj=vehicle, obj_in=veh_in.model_dump(exclude_unset=True))
    return success_response(data=VehicleResponse.model_validate(updated).model_dump(mode="json"))

@router.delete("/{id}")
async def delete_vehicle(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    vehicle = await vehicle_service.get_vehicle(db, id)
    # Using soft delete mixin
    await vehicle_repository.soft_remove(db, id=id)
    return success_response(data={"message": "Vehicle soft-deleted successfully"})
