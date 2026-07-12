import re
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.expense import Expense
from app.models.fuel_log import FuelLog

class CopilotService:
    async def process_query(self, db: AsyncSession, *, query: str) -> dict:
        query_lower = query.lower().strip()

        # Intent 1: Active Vehicles Count
        if "active vehicle" in query_lower or "how many vehicle" in query_lower:
            result = await db.execute(select(func.count()).select_from(Vehicle).filter(Vehicle.status == "active", Vehicle.is_deleted == False))
            count = result.scalar() or 0
            return {
                "intent": "vehicle_count",
                "response_text": f"There are currently {count} active vehicles in the fleet.",
                "data": {"active_vehicles": count}
            }

        # Intent 2: Available Drivers
        if "available driver" in query_lower or "free driver" in query_lower:
            result = await db.execute(select(Driver).filter(Driver.status == "available", Driver.is_active == True, Driver.is_deleted == False))
            drivers = result.scalars().all()
            names = [f"{d.first_name} {d.last_name}" for d in drivers]
            response_text = f"There are {len(drivers)} drivers available: {', '.join(names)}" if names else "No drivers are currently available."
            return {
                "intent": "driver_availability",
                "response_text": response_text,
                "data": [{"id": str(d.id), "name": f"{d.first_name} {d.last_name}"} for d in drivers]
            }

        # Intent 3: Find vehicle by plate
        plate_match = re.search(r"plate\s+([a-zA-Z0-9\-]+)", query_lower) or re.search(r"vehicle\s+([a-zA-Z0-9\-]+)", query_lower)
        if plate_match:
            plate = plate_match.group(1).upper()
            result = await db.execute(select(Vehicle).filter(Vehicle.license_plate == plate, Vehicle.is_deleted == False))
            vehicle = result.scalars().first()
            if vehicle:
                return {
                    "intent": "find_vehicle",
                    "response_text": f"Found vehicle: {vehicle.make} {vehicle.model} ({vehicle.year}) with license plate {vehicle.license_plate}. Status is {vehicle.status} with mileage {vehicle.mileage} miles.",
                    "data": {"id": str(vehicle.id), "make": vehicle.make, "model": vehicle.model, "plate": vehicle.license_plate, "status": vehicle.status}
                }
            else:
                return {
                    "intent": "find_vehicle",
                    "response_text": f"Could not find any vehicle with license plate matching '{plate}'.",
                    "data": None
                }

        # Intent 4: Total Distance Covered
        if "distance" in query_lower or "miles" in query_lower:
            result = await db.execute(select(func.sum(Trip.actual_distance)).filter(Trip.status == "completed", Trip.is_deleted == False))
            total_dist = result.scalar() or 0.0
            return {
                "intent": "fleet_distance",
                "response_text": f"The total distance covered by completed trips is {total_dist:.2f} miles.",
                "data": {"total_distance": total_dist}
            }

        # Fallback Intent
        return {
            "intent": "unknown",
            "response_text": "I couldn't match your query to a specific command. You can ask me about 'active vehicles', 'available drivers', 'distance covered', or 'find vehicle [plate]'.",
            "data": None
        }

copilot_service = CopilotService()
