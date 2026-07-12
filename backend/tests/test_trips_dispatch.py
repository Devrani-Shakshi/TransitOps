import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.test_vehicles import get_auth_headers
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip

@pytest.mark.asyncio
async def test_trip_dispatch_rejections(client: AsyncClient, db: AsyncSession):
    headers = await get_auth_headers(client, db)

    # 1. Create a valid active vehicle & available driver
    vehicle = Vehicle(
        license_plate="TRIP-V1",
        vin="VINTRIPV111111111",
        make="Ford",
        model="F150",
        year=2021,
        status="active",
        mileage=5000.0,
        fuel_type="gasoline"
    )
    driver = Driver(
        first_name="Alice",
        last_name="Wonder",
        email="alice.wonder@example.com",
        phone="555-4444",
        license_number="DL-ALICE111",
        status="available",
        is_active=True
    )
    db.add_all([vehicle, driver])
    await db.commit()
    await db.refresh(vehicle)
    await db.refresh(driver)

    # Case 1: Missing vehicle (404)
    missing_veh_payload = {
        "origin": "A",
        "destination": "B",
        "estimated_distance": 10.0,
        "vehicle_id": str(uuid.uuid4()),
        "driver_id": str(driver.id)
    }
    res = await client.post("/api/v1/trips/", json=missing_veh_payload, headers=headers)
    assert res.status_code == 404
    assert "Vehicle not found" in res.json()["error"]

    # Case 1 (cont): Missing driver (404)
    missing_drv_payload = {
        "origin": "A",
        "destination": "B",
        "estimated_distance": 10.0,
        "vehicle_id": str(vehicle.id),
        "driver_id": str(uuid.uuid4())
    }
    res = await client.post("/api/v1/trips/", json=missing_drv_payload, headers=headers)
    assert res.status_code == 404
    assert "Driver not found" in res.json()["error"]

    # Case 2: Inactive vehicle (400)
    inactive_vehicle = Vehicle(
        license_plate="TRIP-V2",
        vin="VINTRIPV222222222",
        make="Ford",
        model="F150",
        year=2021,
        status="out_of_service",
        mileage=5000.0,
        fuel_type="gasoline",
        is_active=False
    )
    db.add(inactive_vehicle)
    await db.commit()
    await db.refresh(inactive_vehicle)

    inactive_veh_payload = {
        "origin": "A",
        "destination": "B",
        "vehicle_id": str(inactive_vehicle.id),
        "driver_id": str(driver.id)
    }
    res = await client.post("/api/v1/trips/", json=inactive_veh_payload, headers=headers)
    assert res.status_code == 400
    assert "inactive or out of service" in res.json()["error"]

    # Case 2 (cont): Suspended driver (400)
    suspended_driver = Driver(
        first_name="Bob",
        last_name="Builder",
        email="bob.builder@example.com",
        phone="555-5555",
        license_number="DL-BOB22222",
        status="suspended",
        is_active=True
    )
    db.add(suspended_driver)
    await db.commit()
    await db.refresh(suspended_driver)

    suspended_drv_payload = {
        "origin": "A",
        "destination": "B",
        "vehicle_id": str(vehicle.id),
        "driver_id": str(suspended_driver.id)
    }
    res = await client.post("/api/v1/trips/", json=suspended_drv_payload, headers=headers)
    assert res.status_code == 400
    assert "inactive or suspended" in res.json()["error"]

    # Case 3: Vehicle already on an active trip
    # Let's create an active trip for vehicle
    trip = Trip(
        trip_number="TRIP-A1",
        origin="A",
        destination="B",
        status="dispatched",
        vehicle_id=vehicle.id,
        driver_id=driver.id
    )
    db.add(trip)
    await db.commit()

    # Try dispatching another trip with same vehicle
    new_driver = Driver(
        first_name="Charlie",
        last_name="Brown",
        email="charlie.brown@example.com",
        phone="555-6666",
        license_number="DL-CHARLIE1",
        status="available",
        is_active=True
    )
    db.add(new_driver)
    await db.commit()
    await db.refresh(new_driver)

    double_veh_payload = {
        "origin": "X",
        "destination": "Y",
        "vehicle_id": str(vehicle.id),
        "driver_id": str(new_driver.id)
    }
    res = await client.post("/api/v1/trips/", json=double_veh_payload, headers=headers)
    assert res.status_code == 400
    assert "Vehicle is already assigned to an active trip" in res.json()["error"]

    # Case 4: Driver already on an active trip
    new_vehicle = Vehicle(
        license_plate="TRIP-V3",
        vin="VINTRIPV333333333",
        make="Tesla",
        model="Model 3",
        year=2022,
        status="active",
        mileage=1000.0,
        fuel_type="electric"
    )
    db.add(new_vehicle)
    await db.commit()
    await db.refresh(new_vehicle)

    double_drv_payload = {
        "origin": "X",
        "destination": "Y",
        "vehicle_id": str(new_vehicle.id),
        "driver_id": str(driver.id)  # Alice is on active trip TRIP-A1
    }
    res = await client.post("/api/v1/trips/", json=double_drv_payload, headers=headers)
    assert res.status_code == 400
    assert "Driver is already assigned to an active trip" in res.json()["error"]

    # Case 5: Vehicle in maintenance status
    maint_vehicle = Vehicle(
        license_plate="TRIP-VM",
        vin="VINTRIPVM11111111",
        make="Ford",
        model="Transit",
        year=2019,
        status="maintenance",
        mileage=8000.0,
        fuel_type="diesel"
    )
    db.add(maint_vehicle)
    await db.commit()
    await db.refresh(maint_vehicle)

    maint_veh_payload = {
        "origin": "X",
        "destination": "Y",
        "vehicle_id": str(maint_vehicle.id),
        "driver_id": str(new_driver.id)
    }
    res = await client.post("/api/v1/trips/", json=maint_veh_payload, headers=headers)
    assert res.status_code == 400
    assert "undergoing maintenance" in res.json()["error"]
