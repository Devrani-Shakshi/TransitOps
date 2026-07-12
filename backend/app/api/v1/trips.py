import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.repositories.trip_repository import trip_repository
from app.services.trip_service import trip_service
from app.services.dispatch_recommendation_service import dispatch_recommendation_service
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.utils.response_envelope import success_response

router = APIRouter()

class TripTransitionRequest(BaseModel):
    status: str
    actual_distance: float | None = None

@router.get("/")
async def list_trips(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trips = await trip_repository.get_multi(db, skip=skip, limit=limit)
    data = [TripResponse.model_validate(t).model_dump(mode="json") for t in trips]
    return success_response(data=data)

@router.get("/recommendations")
async def get_dispatch_recommendations(origin: str | None = None, destination: str | None = None, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    recs = await dispatch_recommendation_service.get_recommendations(db, origin=origin, destination=destination)
    return success_response(data=recs)

@router.get("/{id}")
async def get_trip(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trip = await trip_repository.get(db, id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return success_response(data=TripResponse.model_validate(trip).model_dump(mode="json"))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_trip(trip_in: TripCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trip = await trip_service.create_trip(
        db,
        origin=trip_in.origin,
        destination=trip_in.destination,
        vehicle_id=trip_in.vehicle_id,
        driver_id=trip_in.driver_id,
        estimated_distance=trip_in.estimated_distance
    )
    return success_response(data=TripResponse.model_validate(trip).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.put("/{id}")
async def update_trip(id: uuid.UUID, trip_in: TripUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trip = await trip_repository.get(db, id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    updated = await trip_repository.update(db, db_obj=trip, obj_in=trip_in.model_dump(exclude_unset=True))
    return success_response(data=TripResponse.model_validate(updated).model_dump(mode="json"))

@router.delete("/{id}")
async def delete_trip(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trip = await trip_repository.get(db, id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    await trip_repository.soft_remove(db, id=id)
    return success_response(data={"message": "Trip soft-deleted successfully"})

@router.post("/{id}/transition")
async def transition_trip(id: uuid.UUID, transition: TripTransitionRequest, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    updated_trip = await trip_service.transition_status(
        db,
        trip_id=id,
        new_status=transition.status,
        actual_distance=transition.actual_distance
    )
    return success_response(data=TripResponse.model_validate(updated_trip).model_dump(mode="json"))
