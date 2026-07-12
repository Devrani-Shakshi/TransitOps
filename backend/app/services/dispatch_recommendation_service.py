from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip

class DispatchRecommendationService:
    async def get_recommendations(self, db: AsyncSession, *, origin: str | None = None, destination: str | None = None) -> list[dict]:
        # 1. Fetch all active vehicles
        veh_query = select(Vehicle).filter(Vehicle.status == "active", Vehicle.is_deleted == False)
        veh_res = await db.execute(veh_query)
        vehicles = veh_res.scalars().all()

        # 2. Fetch all active and available drivers
        drv_query = select(Driver).filter(Driver.status == "available", Driver.is_active == True, Driver.is_deleted == False)
        drv_res = await db.execute(drv_query)
        drivers = drv_res.scalars().all()

        # 3. Filter out vehicles and drivers currently on active trips
        active_trips_query = select(Trip).filter(
            Trip.status.in_(["requested", "dispatched", "active"]),
            Trip.is_deleted == False
        )
        trips_res = await db.execute(active_trips_query)
        active_trips = trips_res.scalars().all()

        busy_vehicle_ids = {t.vehicle_id for t in active_trips}
        busy_driver_ids = {t.driver_id for t in active_trips}

        available_vehicles = [v for v in vehicles if v.id not in busy_vehicle_ids]
        available_drivers = [d for d in drivers if d.id not in busy_driver_ids]

        # 4. Generate recommendation pairs
        recommendations = []
        for vehicle in available_vehicles:
            for driver in available_drivers:
                # Calculate a mock recommendation score (e.g. using mileage and experience)
                # Lower mileage vehicles and available drivers get slightly higher scores
                base_score = 100.0
                # Deduct score for high mileage
                base_score -= min(vehicle.mileage / 1000.0, 30.0)
                
                # Match reason
                reason = "Vehicle is active and driver is available. Optimal mileage allocation."

                recommendations.append({
                    "vehicle": {
                        "id": str(vehicle.id),
                        "license_plate": vehicle.license_plate,
                        "make": vehicle.make,
                        "model": vehicle.model,
                        "mileage": vehicle.mileage
                    },
                    "driver": {
                        "id": str(driver.id),
                        "first_name": driver.first_name,
                        "last_name": driver.last_name,
                        "license_number": driver.license_number
                    },
                    "suitability_score": round(max(base_score, 0.0), 2),
                    "recommendation_reason": reason
                })

        # Sort recommendations by score descending
        recommendations.sort(key=lambda x: x["suitability_score"], reverse=True)
        return recommendations

dispatch_recommendation_service = DispatchRecommendationService()
