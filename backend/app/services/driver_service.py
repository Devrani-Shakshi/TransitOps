import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.driver_repository import driver_repository
from app.models.driver import Driver
from app.core.exceptions import CoreException

class DriverService:
    async def get_driver(self, db: AsyncSession, driver_id: uuid.UUID) -> Driver:
        driver = await driver_repository.get(db, driver_id)
        if not driver:
            raise CoreException("Driver not found", status_code=404)
        return driver

    async def create_driver(self, db: AsyncSession, *, first_name: str, last_name: str, email: str, phone: str, license_number: str) -> Driver:
        existing_email = await driver_repository.get_by_email(db, email=email)
        if existing_email:
            raise CoreException("Driver with this email already exists", status_code=400)
        
        existing_license = await driver_repository.get_by_license_number(db, license_number=license_number)
        if existing_license:
            raise CoreException("Driver with this license number already exists", status_code=400)
        
        data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "license_number": license_number,
            "status": "available",
            "is_active": True
        }
        return await driver_repository.create(db, obj_in=data)

driver_service = DriverService()
