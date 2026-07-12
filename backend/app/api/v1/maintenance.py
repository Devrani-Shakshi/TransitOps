import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user, RoleChecker
from app.repositories.maintenance_repository import maintenance_repository
from app.services.maintenance_service import maintenance_service
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.utils.response_envelope import success_response

router = APIRouter(dependencies=[Depends(RoleChecker(["admin", "fleet_manager", "safety_officer"]))])

@router.get("")
@router.get("/")
async def list_maintenance_logs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    logs = await maintenance_repository.get_multi(db, skip=skip, limit=limit)
    data = [MaintenanceResponse.model_validate(l).model_dump(mode="json") for l in logs]
    return success_response(data=data)

@router.get("/{id}")
async def get_maintenance_log(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await maintenance_repository.get(db, id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return success_response(data=MaintenanceResponse.model_validate(log).model_dump(mode="json"))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def schedule_maintenance(log_in: MaintenanceCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await maintenance_service.schedule_maintenance(
        db,
        vehicle_id=log_in.vehicle_id,
        service_type=log_in.service_type,
        description=log_in.description,
        service_date=log_in.service_date,
        cost=log_in.cost
    )
    return success_response(data=MaintenanceResponse.model_validate(log).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.post("/{id}/complete")
async def complete_maintenance(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await maintenance_service.complete_maintenance(db, log_id=id)
    return success_response(data=MaintenanceResponse.model_validate(log).model_dump(mode="json"))

@router.put("/{id}")
async def update_maintenance_log(id: uuid.UUID, log_in: MaintenanceUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await maintenance_repository.get(db, id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    updated = await maintenance_repository.update(db, db_obj=log, obj_in=log_in.model_dump(exclude_unset=True))
    return success_response(data=MaintenanceResponse.model_validate(updated).model_dump(mode="json"))

@router.delete("/{id}")
async def delete_maintenance_log(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    log = await maintenance_repository.get(db, id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    await maintenance_repository.soft_remove(db, id=id)
    return success_response(data={"message": "Maintenance log soft-deleted successfully"})
