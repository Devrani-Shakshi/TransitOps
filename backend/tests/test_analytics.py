import pytest
import datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.test_vehicles import get_auth_headers
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.fuel_log import FuelLog
from app.models.maintenance_log import MaintenanceLog
from app.models.expense import Expense

@pytest.mark.asyncio
async def test_analytics_metrics(client: AsyncClient, db: AsyncSession):
    headers = await get_auth_headers(client, db)

    # 1. Add vehicles (one active, one under maintenance)
    v1 = Vehicle(
        license_plate="AN-1", vin="VINAN111111111111", make="Ford", model="Transit",
        year=2019, status="active", mileage=10000.0, fuel_type="gasoline"
    )
    v2 = Vehicle(
        license_plate="AN-2", vin="VINAN222222222222", make="Ford", model="Transit",
        year=2019, status="maintenance", mileage=12000.0, fuel_type="gasoline"
    )
    # Add driver
    drv = Driver(
        first_name="Jane", last_name="Doe", email="jane.doe.an@example.com",
        phone="555-8888", license_number="DL-JANEAN1", status="available", is_active=True
    )
    db.add_all([v1, v2, drv])
    await db.commit()
    await db.refresh(v1)
    await db.refresh(v2)
    await db.refresh(drv)

    # Health score: 1 active out of 2 total -> 50%
    # (Note: there might be other vehicles seeded by previous tests, but we'll verify it relative to total)

    # 2. Add completed trip (100 miles)
    trip = Trip(
        trip_number="TRIP-AN1", origin="A", destination="B", status="completed",
        actual_distance=100.0, vehicle_id=v1.id, driver_id=drv.id
    )
    
    # 3. Add fuel log ($30 cost, 10 gallons)
    fuel = FuelLog(
        refuel_date=datetime.date.today(), odometer=10100.0, gallons=10.0, cost=30.0,
        vehicle_id=v1.id
    )

    # 4. Add maintenance log ($20 cost)
    maint = MaintenanceLog(
        service_type="routine", description="Inspection", cost=20.0,
        service_date=datetime.date.today(), status="completed", vehicle_id=v2.id
    )

    # 5. Add direct expense ($50 cost)
    exp = Expense(
        category="toll", description="Highway toll", amount=50.0,
        expense_date=datetime.date.today(), vehicle_id=v1.id
    )

    db.add_all([trip, fuel, maint, exp])
    await db.commit()

    # Get analytics summary
    res = await client.get("/api/v1/analytics/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]

    # Distance
    assert data["total_distance_covered"] >= 100.0
    # Fuel
    assert data["total_fuel_consumed"] >= 10.0
    
    # Check health metrics format
    assert "health" in data
    assert "score" in data["health"]
    
    # Check ROI metrics format
    assert "roi" in data
    assert "total_revenue" in data["roi"]
    assert "total_expenses" in data["roi"]
    assert "net_profit" in data["roi"]
    assert "roi_percentage" in data["roi"]
