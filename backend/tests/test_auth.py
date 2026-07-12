import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_admin_creation_and_user_login(client: AsyncClient, db: AsyncSession):
    # 1. Seed roles: ADMIN and FLEET_MANAGER
    admin_role = Role(name="ADMIN", description="Admin role")
    fleet_role = Role(name="FLEET_MANAGER", description="Fleet Manager role")
    db.add_all([admin_role, fleet_role])
    await db.commit()
    await db.refresh(admin_role)
    await db.refresh(fleet_role)

    # 2. Create the bootstrap admin user
    admin_user = User(
        email="admin@transitops.io",
        hashed_password=get_password_hash("Demo@123"),
        full_name="System Administrator",
        mobile_number="9999999999",
        gender="Other",
        must_change_password=False,
        is_active=True,
        is_superuser=True,
        role_id=admin_role.id
    )
    db.add(admin_user)
    await db.commit()

    # 3. Login as Admin
    login_data = {
        "username": "admin@transitops.io",
        "password": "Demo@123"
    }
    login_res = await client.post("/api/v1/auth/login", data=login_data)
    assert login_res.status_code == 200
    res_json = login_res.json()
    access_token = res_json.get("access_token") or res_json.get("data", {}).get("access_token")
    assert access_token is not None
    
    headers = {"Authorization": f"Bearer {access_token}"}

    # 4. Create a new user as Admin
    create_payload = {
        "full_name": "Marcus Vance",
        "email": "marcus.vance@transitops.io",
        "mobile_number": "1234567890",
        "gender": "Male",
        "role": "fleet_manager"
    }
    response = await client.post("/api/v1/users/", json=create_payload, headers=headers)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["email"] == "marcus.vance@transitops.io"
    assert res_data["data"]["mobile_number"] == "1234567890"

    # 5. Login as the newly created user (password = mobile_number)
    user_login_data = {
        "username": "marcus.vance@transitops.io",
        "password": "1234567890"
    }
    user_login_res = await client.post("/api/v1/auth/login", data=user_login_data)
    assert user_login_res.status_code == 200
    res_user_json = user_login_res.json()
    user_access_token = res_user_json.get("access_token") or res_user_json.get("data", {}).get("access_token")
    assert user_access_token is not None

    # 6. Fetch user profile using /auth/me
    user_headers = {"Authorization": f"Bearer {user_access_token}"}
    me_res = await client.get("/api/v1/auth/me", headers=user_headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["success"] is True
    assert me_data["data"]["email"] == "marcus.vance@transitops.io"
    assert me_data["data"]["role"] == "FLEET_MANAGER"

