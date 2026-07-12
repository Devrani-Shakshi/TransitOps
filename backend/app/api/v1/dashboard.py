from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, Date
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.expense import Expense
from app.utils.response_envelope import success_response

router = APIRouter()

@router.get("")
async def get_dashboard(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Base queries for Vehicles
    vehicle_stmt = select(Vehicle).filter(Vehicle.is_deleted == False)
    
    # Apply type filter (TRUCK, VAN, CONTAINER) on Vehicle model/make/fuel_type
    if type:
        vehicle_stmt = vehicle_stmt.filter(
            (Vehicle.model.ilike(f"%{type}%")) | 
            (Vehicle.make.ilike(f"%{type}%")) |
            (Vehicle.fuel_type.ilike(f"%{type}%"))
        )
        
    # Apply status filter
    if status:
        if status == "AVAILABLE":
            vehicle_stmt = vehicle_stmt.filter(Vehicle.status == "active")
        elif status == "IN_SHOP":
            vehicle_stmt = vehicle_stmt.filter(Vehicle.status == "maintenance")
        elif status == "ON_TRIP":
            vehicle_stmt = vehicle_stmt.filter(Vehicle.status == "active")
            
    res_vehicles = await db.execute(vehicle_stmt)
    vehicles = res_vehicles.scalars().all()
    
    # 2. Base queries for Drivers
    driver_stmt = select(Driver).filter(Driver.is_deleted == False)
    res_drivers = await db.execute(driver_stmt)
    drivers = res_drivers.scalars().all()
    
    # 3. Base queries for Trips
    trip_stmt = select(Trip).filter(Trip.is_deleted == False)
    
    if region:
        trip_stmt = trip_stmt.filter(
            (Trip.origin.ilike(f"%{region}%")) | 
            (Trip.destination.ilike(f"%{region}%"))
        )
        
    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            trip_stmt = trip_stmt.filter(func.cast(Trip.start_time, Date) == filter_date)
        except Exception:
            pass
            
    res_trips = await db.execute(trip_stmt)
    trips = res_trips.scalars().all()
    
    # 4. Calculate KPI statistics
    total_vehicles_count = len(vehicles)
    vehicles_in_maintenance = sum(1 for v in vehicles if v.status == "maintenance")
    active_trips_list = [t for t in trips if t.status in ["dispatched", "active"]]
    active_trips_count = len(active_trips_list)
    pending_trips_count = sum(1 for t in trips if t.status == "requested")
    
    # Active vehicles (vehicles currently on trips)
    active_vehicles_count = min(active_trips_count, sum(1 for v in vehicles if v.status == "active"))
    
    # Available vehicles (active vehicles not currently on a trip)
    available_vehicles_count = max(0, sum(1 for v in vehicles if v.status == "active") - active_vehicles_count)
    
    # Drivers on duty (available or on_trip status)
    drivers_on_duty = sum(1 for d in drivers if d.status in ["available", "on_trip"] and d.is_active)
    
    # Fleet utilization
    if total_vehicles_count > 0:
        fleet_utilization = int((active_vehicles_count / total_vehicles_count) * 100)
    else:
        fleet_utilization = 0
        
    # 5. Format recent trips
    # Sort trips by start_time descending, limit to 5
    sorted_trips = sorted(
        trips, 
        key=lambda x: x.start_time if x.start_time else datetime.min, 
        reverse=True
    )[:5]
    
    recent_trips_data = []
    for t in sorted_trips:
        recent_trips_data.append({
            "id": str(t.id),
            "trip_code": t.trip_number,
            "source": t.origin,
            "destination": t.destination,
            "cargo_weight_kg": 5000, 
            "planned_distance_km": int(t.estimated_distance) if t.estimated_distance else 0,
            "status": t.status.upper()
        })
        
    # 6. Format vehicle statuses distribution
    vehicle_statuses_data = [
        {"status": "AVAILABLE", "count": available_vehicles_count},
        {"status": "ON_TRIP", "count": active_vehicles_count},
        {"status": "IN_SHOP", "count": vehicles_in_maintenance},
        {"status": "RETIRED", "count": sum(1 for v in vehicles if v.status == "out_of_service")}
    ]
    
    return success_response(data={
        "active_vehicles": active_vehicles_count,
        "available_vehicles": available_vehicles_count,
        "vehicles_in_maintenance": vehicles_in_maintenance,
        "active_trips": active_trips_count,
        "pending_trips": pending_trips_count,
        "drivers_on_duty": drivers_on_duty,
        "fleet_utilization": fleet_utilization,
        "recent_trips": recent_trips_data,
        "vehicle_statuses": vehicle_statuses_data
    })

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    # Legacy endpoint support
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

