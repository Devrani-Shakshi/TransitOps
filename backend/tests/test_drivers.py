import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.test_vehicles import get_auth_headers

@pytest.mark.asyncio
async def test_driver_crud(client: AsyncClient, db: AsyncSession):
    headers = await get_auth_headers(client, db)

    # 1. Create Driver
    payload = {
        "first_name": "Bob",
        "last_name": "Ross",
        "email": "bob.ross@example.com",
        "phone": "555-0303",
        "license_number": "DL-BOB12345",
        "status": "available",
        "is_active": True
    }
    create_res = await client.post("/api/v1/drivers/", json=payload, headers=headers)
    assert create_res.status_code == 201
    drv_data = create_res.json()["data"]
    drv_id = drv_data["id"]
    assert drv_data["email"] == "bob.ross@example.com"

    # 2. Get drivers list
    list_res = await client.get("/api/v1/drivers/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

    # 3. Get single driver
    get_res = await client.get(f"/api/v1/drivers/{drv_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["first_name"] == "Bob"

    # 4. Update driver
    update_res = await client.put(f"/api/v1/drivers/{drv_id}", json={"phone": "555-9999"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["data"]["phone"] == "555-9999"

    # 5. Delete driver
    del_res = await client.delete(f"/api/v1/drivers/{drv_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["message"] == "Driver soft-deleted successfully"
