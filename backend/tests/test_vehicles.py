import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash

async def get_auth_headers(client: AsyncClient, db: AsyncSession) -> dict:
    # Ensure role and user exist
    role = Role(name="admin", description="Admin")
    db.add(role)
    await db.commit()
    await db.refresh(role)

    user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Admin User",
        is_active=True,
        is_superuser=True,
        role_id=role.id
    )
    db.add(user)
    await db.commit()

    # Login
    res = await client.post("/api/v1/auth/login", data={"username": "admin@example.com", "password": "password123"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_vehicle_crud(client: AsyncClient, db: AsyncSession):
    headers = await get_auth_headers(client, db)

    # 1. Create Vehicle
    payload = {
        "license_plate": "TEST-111",
        "vin": "TESTVIN1111111111",
        "make": "Honda",
        "model": "Civic",
        "year": 2020,
        "mileage": 12000.0,
        "status": "active"
    }
    create_res = await client.post("/api/v1/vehicles/", json=payload, headers=headers)
    assert create_res.status_code == 201
    veh_data = create_res.json()["data"]
    veh_id = veh_data["id"]
    assert veh_data["license_plate"] == "TEST-111"

    # 2. Get Vehicles list
    list_res = await client.get("/api/v1/vehicles/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

    # 3. Get single vehicle
    get_res = await client.get(f"/api/v1/vehicles/{veh_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["license_plate"] == "TEST-111"

    # 4. Update vehicle
    update_res = await client.put(f"/api/v1/vehicles/{veh_id}", json={"mileage": 13500.0}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["data"]["mileage"] == 13500.0

    # 5. Delete vehicle
    del_res = await client.delete(f"/api/v1/vehicles/{veh_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["message"] == "Vehicle soft-deleted successfully"
