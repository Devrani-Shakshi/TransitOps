from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.expense import Expense
from app.utils.response_envelope import success_response

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    total_vehicles = (await db.execute(select(func.count(Vehicle.id)).filter(Vehicle.is_deleted == False))).scalar() or 0
    active_vehicles = (await db.execute(select(func.count(Vehicle.id)).filter(Vehicle.status == "active", Vehicle.is_deleted == False))).scalar() or 0
    
    total_drivers = (await db.execute(select(func.count(Driver.id)).filter(Driver.is_deleted == False))).scalar() or 0
    available_drivers = (await db.execute(select(func.count(Driver.id)).filter(Driver.status == "available", Driver.is_active == True, Driver.is_deleted == False))).scalar() or 0
    
    active_trips = (await db.execute(select(func.count(Trip.id)).filter(Trip.status.in_(["requested", "dispatched", "active"]), Trip.is_deleted == False))).scalar() or 0
    total_expenses = (await db.execute(select(func.sum(Expense.amount)).filter(Expense.is_deleted == False))).scalar() or 0.0

    return success_response(data={
        "vehicles": {
            "total": total_vehicles,
            "active": active_vehicles
        },
        "drivers": {
            "total": total_drivers,
            "available": available_drivers
        },
        "active_trips": active_trips,
        "total_expenses": total_expenses
    })
