import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.role import Role

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient, db: AsyncSession):
    # 1. Seed the admin role
    role = Role(name="admin", description="Admin role")
    db.add(role)
    await db.commit()
    await db.refresh(role)

    # 2. Register a new user
    reg_payload = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "role_id": str(role.id)
    }
    response = await client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 211 or response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["email"] == "test@example.com"

    # 3. Login to get token
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    login_res = await client.post("/api/v1/auth/login", data=login_data)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data

    # 4. Refresh token
    refresh_res = await client.post("/api/v1/auth/refresh", params={"refresh_token": token_data["refresh_token"]})
    assert refresh_res.status_code == 200
    new_token_data = refresh_res.json()
    assert "access_token" in new_token_data
    assert "refresh_token" in new_token_data
