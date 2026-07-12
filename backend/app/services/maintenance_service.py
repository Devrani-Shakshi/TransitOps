import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.maintenance_repository import maintenance_repository
from app.repositories.vehicle_repository import vehicle_repository
from app.models.maintenance_log import MaintenanceLog
from app.core.exceptions import CoreException

class MaintenanceService:
    async def schedule_maintenance(
        self, db: AsyncSession, *, vehicle_id: uuid.UUID, service_type: str, description: str, service_date: date, cost: float = 0.0
    ) -> MaintenanceLog:
        vehicle = await vehicle_repository.get(db, vehicle_id)
        if not vehicle:
            raise CoreException("Vehicle not found", status_code=404)
        
        # Schedule maintenance
        log_data = {
            "vehicle_id": vehicle_id,
            "service_type": service_type,
            "description": description,
            "service_date": service_date,
            "cost": cost,
            "status": "scheduled"
        }
        log = await maintenance_repository.create(db, obj_in=log_data)
        
        # Optionally trigger vehicle state change
        vehicle.status = "maintenance"
        db.add(vehicle)
        await db.commit()
        return log

    async def complete_maintenance(self, db: AsyncSession, *, log_id: uuid.UUID) -> MaintenanceLog:
        log = await maintenance_repository.get(db, log_id)
        if not log:
            raise CoreException("Maintenance log not found", status_code=404)
        
        log.status = "completed"
        db.add(log)
        
        # Restore vehicle status to active
        vehicle = log.vehicle
        vehicle.status = "active"
        db.add(vehicle)
        
        await db.commit()
        await db.refresh(log)
        return log

maintenance_service = MaintenanceService()
