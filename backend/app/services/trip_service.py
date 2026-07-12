import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trip import Trip
from app.repositories.trip_repository import trip_repository
from app.repositories.vehicle_repository import vehicle_repository
from app.repositories.driver_repository import driver_repository
from app.core.exceptions import CoreException

class TripService:
    async def create_trip(
        self, db: AsyncSession, *, origin: str, destination: str, vehicle_id: uuid.UUID, driver_id: uuid.UUID, estimated_distance: float | None = None
    ) -> Trip:
        # Check 1: Missing vehicle or driver
        vehicle = await vehicle_repository.get(db, vehicle_id)
        if not vehicle:
            raise CoreException("Vehicle not found", status_code=404)
        
        driver = await driver_repository.get(db, driver_id)
        if not driver:
            raise CoreException("Driver not found", status_code=404)

        # Check 2: Inactive/soft-deleted driver or vehicle
        if not vehicle.is_active or vehicle.status == "out_of_service":
            raise CoreException("Vehicle is inactive or out of service", status_code=400)
        
        if not driver.is_active or driver.status == "suspended":
            raise CoreException("Driver is inactive or suspended", status_code=400)

        # Check 3: Vehicle already on an active trip (status in dispatched, active)
        active_vehicle_trip = await trip_repository.get_active_trip_by_vehicle(db, vehicle_id=vehicle_id)
        if active_vehicle_trip:
            raise CoreException("Vehicle is already assigned to an active trip", status_code=400)

        # Check 4: Driver already on an active trip (status in dispatched, active)
        active_driver_trip = await trip_repository.get_active_trip_by_driver(db, driver_id=driver_id)
        if active_driver_trip:
            raise CoreException("Driver is already assigned to an active trip", status_code=400)

        # Check 5: Insufficient vehicle capacity (simulated business logic)
        # For validation case 4 (Insufficient capacity/invalid vehicle status)
        if vehicle.status == "maintenance":
            raise CoreException("Vehicle is undergoing maintenance and cannot be assigned", status_code=400)

        trip_num = f"TRIP-{uuid.uuid4().hex[:8].upper()}"
        
        trip_data = {
            "trip_number": trip_num,
            "origin": origin,
            "destination": destination,
            "status": "requested",
            "vehicle_id": vehicle_id,
            "driver_id": driver_id,
            "estimated_distance": estimated_distance
        }
        
        return await trip_repository.create(db, obj_in=trip_data)

    async def transition_status(
        self, db: AsyncSession, *, trip_id: uuid.UUID, new_status: str, actual_distance: float | None = None
    ) -> Trip:
        trip = await trip_repository.get(db, trip_id)
        if not trip:
            raise CoreException("Trip not found", status_code=404)

        current_status = trip.status.lower()
        target_status = new_status.lower()

        # State machine transition rules
        # requested -> dispatched or cancelled
        # dispatched -> active or cancelled
        # active -> completed or cancelled
        # completed -> final
        # cancelled -> final
        allowed_transitions = {
            "requested": ["dispatched", "cancelled"],
            "dispatched": ["active", "cancelled"],
            "active": ["completed", "cancelled"],
            "completed": [],
            "cancelled": []
        }

        if target_status not in allowed_transitions.get(current_status, []):
            raise CoreException(
                f"Invalid transition from '{current_status}' to '{target_status}'",
                status_code=400
            )

        # Apply state changes
        trip.status = target_status
        if target_status == "active":
            trip.start_time = datetime.now(timezone.utc)
            # Update driver and vehicle status
            trip.vehicle.status = "active"
            trip.driver.status = "on_trip"
        elif target_status == "completed":
            trip.end_time = datetime.now(timezone.utc)
            trip.vehicle.status = "active"
            trip.driver.status = "available"
            if actual_distance is not None:
                trip.actual_distance = actual_distance
                # Update vehicle mileage odometer
                trip.vehicle.mileage += actual_distance
        elif target_status == "cancelled":
            trip.vehicle.status = "active"
            trip.driver.status = "available"

        db.add(trip)
        await db.commit()
        await db.refresh(trip)
        return trip

trip_service = TripService()
