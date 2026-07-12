import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.test_vehicles import get_auth_headers
from app.models.vehicle import Vehicle

@pytest.mark.asyncio
async def test_maintenance_flow(client: AsyncClient, db: AsyncSession):
    headers = await get_auth_headers(client, db)

    # 1. Create a vehicle
    vehicle = Vehicle(
        license_plate="MAINT-1",
        vin="VINMAINT111111111",
        make="Ford",
        model="Transit",
        year=2019,
        status="active",
        mileage=8000.0,
        fuel_type="gasoline"
    )
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)

    # 2. Schedule maintenance
    payload = {
        "vehicle_id": str(vehicle.id),
        "service_type": "routine",
        "description": "Oil Change",
        "cost": 50.0,
        "service_date": "2026-07-15",
        "status": "scheduled"
    }
    schedule_res = await client.post("/api/v1/maintenance/", json=payload, headers=headers)
    assert schedule_res.status_code == 201
    log_data = schedule_res.json()["data"]
    log_id = log_data["id"]

    # Verify vehicle status is updated to 'maintenance'
    await db.refresh(vehicle)
    assert vehicle.status == "maintenance"

    # 3. Complete maintenance
    complete_res = await client.post(f"/api/v1/maintenance/{log_id}/complete", headers=headers)
    assert complete_res.status_code == 200

    # Verify vehicle status is restored to 'active'
    await db.refresh(vehicle)
    assert vehicle.status == "active"
