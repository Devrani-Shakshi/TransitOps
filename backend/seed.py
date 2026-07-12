import asyncio
import datetime
from sqlalchemy import select
from app.core.deps import async_session
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.role import Role
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance_log import MaintenanceLog
from app.models.fuel_log import FuelLog
from app.models.expense import Expense

async def seed_data():
    print("Starting database seeding...")
    async with async_session() as session:
        # 1. Seed Roles
        role_names = ["admin", "dispatcher", "driver"]
        roles_dict = {}
        for rname in role_names:
            stmt = select(Role).filter(Role.name == rname)
            res = await session.execute(stmt)
            role = res.scalars().first()
            if not role:
                role = Role(name=rname, description=f"{rname.capitalize()} role")
                session.add(role)
                await session.flush()
                print(f"Created role: {rname}")
            roles_dict[rname] = role

        # 2. Seed Superuser
        stmt = select(User).filter(User.email == settings.FIRST_SUPERUSER)
        res = await session.execute(stmt)
        superuser = res.scalars().first()
        if not superuser:
            superuser = User(
                email=settings.FIRST_SUPERUSER,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                full_name="System Administrator",
                is_active=True,
                is_superuser=True,
                role_id=roles_dict["admin"].id
            )
            session.add(superuser)
            await session.flush()
            print(f"Created superuser: {settings.FIRST_SUPERUSER}")

        # 3. Seed Vehicles
        vehicles_data = [
            {"license_plate": "ABC-1234", "vin": "1FM5K8D7XEE000001", "make": "Ford", "model": "Explorer", "year": 2014, "status": "active", "mileage": 125000.0, "fuel_type": "gasoline"},
            {"license_plate": "XYZ-5678", "vin": "1FM5K8D7XEE000002", "make": "Toyota", "model": "Prius", "year": 2018, "status": "active", "mileage": 45000.0, "fuel_type": "hybrid"},
            {"license_plate": "MAI-9999", "vin": "1FM5K8D7XEE000003", "make": "Chevrolet", "model": "Bolt", "year": 2020, "status": "maintenance", "mileage": 15000.0, "fuel_type": "electric"}
        ]
        vehicles_dict = {}
        for v_data in vehicles_data:
            stmt = select(Vehicle).filter(Vehicle.license_plate == v_data["license_plate"])
            res = await session.execute(stmt)
            vehicle = res.scalars().first()
            if not vehicle:
                vehicle = Vehicle(**v_data)
                session.add(vehicle)
                await session.flush()
                print(f"Created vehicle: {vehicle.license_plate}")
            vehicles_dict[vehicle.license_plate] = vehicle

        # 4. Seed Drivers
        drivers_data = [
            {"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com", "phone": "555-0199", "license_number": "DL-12345678", "status": "available", "is_active": True},
            {"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@example.com", "phone": "555-0200", "license_number": "DL-87654321", "status": "available", "is_active": True}
        ]
        drivers_dict = {}
        for d_data in drivers_data:
            stmt = select(Driver).filter(Driver.email == d_data["email"])
            res = await session.execute(stmt)
            driver = res.scalars().first()
            if not driver:
                driver = Driver(**d_data)
                session.add(driver)
                await session.flush()
                print(f"Created driver: {driver.email}")
            drivers_dict[driver.email] = driver

        # 5. Seed completed/cancelled Trips (needed for Analytics & ROI metrics)
        stmt = select(Trip).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            trip1 = Trip(
                trip_number="TRIP-00000001",
                origin="Chicago, IL",
                destination="Milwaukee, WI",
                status="completed",
                start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2),
                end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2, hours=2),
                estimated_distance=95.0,
                actual_distance=96.5,
                vehicle_id=vehicles_dict["ABC-1234"].id,
                driver_id=drivers_dict["john.doe@example.com"].id
            )
            trip2 = Trip(
                trip_number="TRIP-00000002",
                origin="San Francisco, CA",
                destination="Oakland, CA",
                status="completed",
                start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1),
                end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1, hours=1),
                estimated_distance=12.0,
                actual_distance=12.8,
                vehicle_id=vehicles_dict["XYZ-5678"].id,
                driver_id=drivers_dict["jane.smith@example.com"].id
            )
            session.add_all([trip1, trip2])
            print("Seeded completed trips.")

        # 6. Seed Fuel Logs
        stmt = select(FuelLog).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            fuel1 = FuelLog(
                refuel_date=datetime.date.today() - datetime.timedelta(days=2),
                odometer=124800.0,
                gallons=15.2,
                cost=45.60,
                vehicle_id=vehicles_dict["ABC-1234"].id
            )
            fuel2 = FuelLog(
                refuel_date=datetime.date.today() - datetime.timedelta(days=1),
                odometer=44980.0,
                gallons=4.1,
                cost=14.35,
                vehicle_id=vehicles_dict["XYZ-5678"].id
            )
            session.add_all([fuel1, fuel2])
            print("Seeded fuel logs.")

        # 7. Seed Maintenance Logs
        stmt = select(MaintenanceLog).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            maint1 = MaintenanceLog(
                service_type="routine",
                description="Regular oil change and tire rotation",
                cost=85.00,
                service_date=datetime.date.today() - datetime.timedelta(days=10),
                status="completed",
                vehicle_id=vehicles_dict["ABC-1234"].id
            )
            session.add(maint1)
            print("Seeded maintenance logs.")

        # 8. Seed Expenses
        stmt = select(Expense).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            exp1 = Expense(
                category="toll",
                description="I-90 expressway tolls",
                amount=12.50,
                expense_date=datetime.date.today() - datetime.timedelta(days=2),
                vehicle_id=vehicles_dict["ABC-1234"].id
            )
            exp2 = Expense(
                category="insurance",
                description="Monthly fleet premium share",
                amount=150.00,
                expense_date=datetime.date.today() - datetime.timedelta(days=5),
                vehicle_id=vehicles_dict["XYZ-5678"].id
            )
            session.add_all([exp1, exp2])
            print("Seeded expenses.")

        await session.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
