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
    print("Starting database seeding of exactly 10 records per table...")
    async with async_session() as session:
        # 1. Seed 10 Roles
        role_names = [
            "ADMIN", "FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST",
            "DISPATCHER", "MAINTENANCE_SUPERVISOR", "LOGISTICS_ANALYST", "COMPLIANCE_AUDITOR", "OPERATIONS_DIRECTOR"
        ]
        roles_dict = {}
        for rname in role_names:
            stmt = select(Role).filter(Role.name == rname)
            res = await session.execute(stmt)
            role = res.scalars().first()
            if not role:
                role = Role(name=rname, description=f"{rname.replace('_', ' ').capitalize()} role")
                session.add(role)
                await session.flush()
                print(f"Created role: {rname}")
            roles_dict[rname] = role

        # Backward compatibility aliases
        roles_dict["admin"] = roles_dict["ADMIN"]
        roles_dict["dispatcher"] = roles_dict["DISPATCHER"]
        roles_dict["driver"] = roles_dict["DRIVER"]

        # 2. Seed Demo Users (Exactly one bootstrap admin per system auth requirements)
        users_to_seed = [
            {
                "email": settings.FIRST_SUPERUSER or "admin@transitops.io",
                "hashed_password": get_password_hash(settings.FIRST_SUPERUSER_PASSWORD or "Demo@123"),
                "full_name": "System Administrator",
                "mobile_number": "9999999999",
                "gender": "Other",
                "must_change_password": False,
                "email_status": "SENT",
                "is_active": True,
                "is_superuser": True,
                "role_id": roles_dict["ADMIN"].id
            }
        ]

        for u_data in users_to_seed:
            stmt = select(User).filter(User.email == u_data["email"])
            res = await session.execute(stmt)
            user = res.scalars().first()
            if not user:
                user = User(**u_data)
                session.add(user)
                await session.flush()
                print(f"Created user: {user.email}")

        # 3. Seed 10 Vehicles
        vehicles_data = [
            {"license_plate": "ABC-1234", "vin": "1FM5K8D7XEE000001", "make": "Ford", "model": "Explorer", "year": 2014, "status": "active", "mileage": 125000.0, "fuel_type": "gasoline"},
            {"license_plate": "XYZ-5678", "vin": "1FM5K8D7XEE000002", "make": "Toyota", "model": "Prius", "year": 2018, "status": "active", "mileage": 45000.0, "fuel_type": "hybrid"},
            {"license_plate": "MAI-9999", "vin": "1FM5K8D7XEE000003", "make": "Chevrolet", "model": "Bolt", "year": 2020, "status": "maintenance", "mileage": 15000.0, "fuel_type": "electric"},
            {"license_plate": "TSLA-0441", "vin": "1FM5K8D7XEE000004", "make": "Tesla", "model": "Semi Electric", "year": 2023, "status": "active", "mileage": 8200.0, "fuel_type": "electric"},
            {"license_plate": "VLV-1832", "vin": "1FM5K8D7XEE000005", "make": "Volvo", "model": "VNL 860", "year": 2021, "status": "active", "mileage": 64000.0, "fuel_type": "diesel"},
            {"license_plate": "FRT-4491", "vin": "1FM5K8D7XEE000006", "make": "Freightliner", "model": "Cascadia", "year": 2019, "status": "active", "mileage": 115000.0, "fuel_type": "diesel"},
            {"license_plate": "TSLA-0982", "vin": "1FM5K8D7XEE000007", "make": "Tesla", "model": "Semi Electric", "year": 2024, "status": "active", "mileage": 3100.0, "fuel_type": "electric"},
            {"license_plate": "VAN-012", "vin": "1FM5K8D7XEE000008", "make": "Ford", "model": "Transit Cargo", "year": 2020, "status": "active", "mileage": 38000.0, "fuel_type": "gasoline"},
            {"license_plate": "VAN-005", "vin": "1FM5K8D7XEE000009", "make": "Mercedes", "model": "Sprinter", "year": 2022, "status": "active", "mileage": 22000.0, "fuel_type": "diesel"},
            {"license_plate": "CON-099", "vin": "1FM5K8D7XEE000010", "make": "LogiCorp", "model": "Cargo Container", "year": 2023, "status": "active", "mileage": 1200.0, "fuel_type": "hybrid"}
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

        # 4. Seed 10 Drivers
        drivers_data = [
            {"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com", "phone": "555-0199", "license_number": "DL-12345678", "status": "available", "is_active": True},
            {"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@example.com", "phone": "555-0200", "license_number": "DL-87654321", "status": "available", "is_active": True},
            {"first_name": "Marcus", "last_name": "Vance", "email": "marcus.vance@example.com", "phone": "555-0201", "license_number": "DL-24681357", "status": "available", "is_active": True},
            {"first_name": "Elena", "last_name": "Rostova", "email": "elena.rostova@example.com", "phone": "555-0202", "license_number": "DL-13579246", "status": "available", "is_active": True},
            {"first_name": "Devang", "last_name": "Panchal", "email": "devang.panchal@example.com", "phone": "555-0203", "license_number": "DL-98765432", "status": "available", "is_active": True},
            {"first_name": "Shakshi", "last_name": "Devrani", "email": "shakshi.devrani@example.com", "phone": "555-0204", "license_number": "DL-11223344", "status": "available", "is_active": True},
            {"first_name": "Priya", "last_name": "Devrani", "email": "priya.devrani@example.com", "phone": "555-0205", "license_number": "DL-55667788", "status": "available", "is_active": True},
            {"first_name": "Robert", "last_name": "Downey", "email": "robert.downey@example.com", "phone": "555-0206", "license_number": "DL-99887766", "status": "available", "is_active": True},
            {"first_name": "Scarlett", "last_name": "Johansson", "email": "scarlett.j@example.com", "phone": "555-0207", "license_number": "DL-44332211", "status": "available", "is_active": True},
            {"first_name": "Chris", "last_name": "Evans", "email": "chris.evans@example.com", "phone": "555-0208", "license_number": "DL-77665544", "status": "available", "is_active": True}
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

        # 5. Seed 10 Trips
        stmt = select(Trip).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            trips = [
                Trip(trip_number="TRIP-00000001", origin="Chicago, IL", destination="Milwaukee, WI", status="completed", estimated_distance=95.0, actual_distance=96.5, vehicle_id=vehicles_dict["ABC-1234"].id, driver_id=drivers_dict["john.doe@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10, hours=2)),
                Trip(trip_number="TRIP-00000002", origin="San Francisco, CA", destination="Oakland, CA", status="completed", estimated_distance=12.0, actual_distance=12.8, vehicle_id=vehicles_dict["XYZ-5678"].id, driver_id=drivers_dict["jane.smith@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=9), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=9, hours=1)),
                Trip(trip_number="TRIP-00000003", origin="Los Angeles, CA", destination="Las Vegas, NV", status="completed", estimated_distance=270.0, actual_distance=275.0, vehicle_id=vehicles_dict["TSLA-0441"].id, driver_id=drivers_dict["marcus.vance@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=8), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=8, hours=4)),
                Trip(trip_number="TRIP-00000004", origin="Seattle, WA", destination="Portland, OR", status="completed", estimated_distance=174.0, actual_distance=175.2, vehicle_id=vehicles_dict["VLV-1832"].id, driver_id=drivers_dict["elena.rostova@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7, hours=3)),
                Trip(trip_number="TRIP-00000005", origin="Houston, TX", destination="Austin, TX", status="completed", estimated_distance=162.0, actual_distance=164.0, vehicle_id=vehicles_dict["FRT-4491"].id, driver_id=drivers_dict["devang.panchal@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=6), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=6, hours=3)),
                Trip(trip_number="TRIP-00000006", origin="Boston, MA", destination="New York, NY", status="completed", estimated_distance=215.0, actual_distance=218.5, vehicle_id=vehicles_dict["TSLA-0982"].id, driver_id=drivers_dict["shakshi.devrani@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=5), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=5, hours=4)),
                Trip(trip_number="TRIP-00000007", origin="Denver, CO", destination="Boulder, CO", status="completed", estimated_distance=30.0, actual_distance=31.2, vehicle_id=vehicles_dict["VAN-012"].id, driver_id=drivers_dict["priya.devrani@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=4), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=4, hours=1)),
                Trip(trip_number="TRIP-00000008", origin="Miami, FL", destination="Orlando, FL", status="completed", estimated_distance=235.0, actual_distance=238.0, vehicle_id=vehicles_dict["VAN-005"].id, driver_id=drivers_dict["robert.downey@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=3), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=3, hours=4)),
                Trip(trip_number="TRIP-00000009", origin="Phoenix, AZ", destination="Tucson, AZ", status="completed", estimated_distance=115.0, actual_distance=116.8, vehicle_id=vehicles_dict["CON-099"].id, driver_id=drivers_dict["scarlett.j@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2, hours=2)),
                Trip(trip_number="TRIP-00000010", origin="Atlanta, GA", destination="Savannah, GA", status="completed", estimated_distance=248.0, actual_distance=250.5, vehicle_id=vehicles_dict["TSLA-0441"].id, driver_id=drivers_dict["chris.evans@example.com"].id, start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1), end_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1, hours=4))
            ]
            session.add_all(trips)
            print("Seeded 10 completed trips.")

        # 6. Seed 10 Fuel Logs
        stmt = select(FuelLog).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            fuel_logs = [
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=10), odometer=124800.0, gallons=15.85, cost=5400.0, vehicle_id=vehicles_dict["ABC-1234"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=9), odometer=44980.0, gallons=3.96, cost=1350.0, vehicle_id=vehicles_dict["XYZ-5678"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=8), odometer=8100.0, gallons=0.0, cost=0.0, vehicle_id=vehicles_dict["TSLA-0441"].id), # Electric charging
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=7), odometer=63800.0, gallons=39.63, cost=13500.0, vehicle_id=vehicles_dict["VLV-1832"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=6), odometer=114800.0, gallons=47.55, cost=16200.0, vehicle_id=vehicles_dict["FRT-4491"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=5), odometer=3000.0, gallons=0.0, cost=0.0, vehicle_id=vehicles_dict["TSLA-0982"].id), # Electric charging
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=4), odometer=37800.0, gallons=10.57, cost=3600.0, vehicle_id=vehicles_dict["VAN-012"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=3), odometer=21800.0, gallons=11.89, cost=4050.0, vehicle_id=vehicles_dict["VAN-005"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=2), odometer=1100.0, gallons=2.64, cost=900.0, vehicle_id=vehicles_dict["CON-099"].id),
                FuelLog(refuel_date=datetime.date.today() - datetime.timedelta(days=1), odometer=124990.0, gallons=14.53, cost=4950.0, vehicle_id=vehicles_dict["ABC-1234"].id)
            ]
            session.add_all(fuel_logs)
            print("Seeded 10 fuel logs.")

        # 7. Seed 10 Maintenance Logs
        stmt = select(MaintenanceLog).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            maintenance_logs = [
                MaintenanceLog(service_type="routine", description="Regular oil change and filter check", cost=850.0, service_date=datetime.date.today() - datetime.timedelta(days=30), status="completed", vehicle_id=vehicles_dict["ABC-1234"].id),
                MaintenanceLog(service_type="repair", description="Brake pads replacement", cost=4500.0, service_date=datetime.date.today() - datetime.timedelta(days=25), status="completed", vehicle_id=vehicles_dict["XYZ-5678"].id),
                MaintenanceLog(service_type="routine", description="Battery diagnostics calibration", cost=1200.0, service_date=datetime.date.today() - datetime.timedelta(days=20), status="completed", vehicle_id=vehicles_dict["TSLA-0441"].id),
                MaintenanceLog(service_type="routine", description="Tyre rotation and alignment checks", cost=1800.0, service_date=datetime.date.today() - datetime.timedelta(days=15), status="completed", vehicle_id=vehicles_dict["VLV-1832"].id),
                MaintenanceLog(service_type="repair", description="Fuel injector replacement check", cost=12000.0, service_date=datetime.date.today() - datetime.timedelta(days=12), status="completed", vehicle_id=vehicles_dict["FRT-4491"].id),
                MaintenanceLog(service_type="routine", description="Coolant system flush routine", cost=1500.0, service_date=datetime.date.today() - datetime.timedelta(days=10), status="completed", vehicle_id=vehicles_dict["VAN-012"].id),
                MaintenanceLog(service_type="routine", description="Suspension alignment checkups", cost=2200.0, service_date=datetime.date.today() - datetime.timedelta(days=8), status="completed", vehicle_id=vehicles_dict["VAN-005"].id),
                MaintenanceLog(service_type="repair", description="Windshield wiper motor swap", cost=950.0, service_date=datetime.date.today() - datetime.timedelta(days=5), status="completed", vehicle_id=vehicles_dict["ABC-1234"].id),
                MaintenanceLog(service_type="routine", description="Brake discs inspection and cleaning", cost=1100.0, service_date=datetime.date.today() - datetime.timedelta(days=3), status="completed", vehicle_id=vehicles_dict["TSLA-0982"].id),
                MaintenanceLog(service_type="routine", description="Air filter replacements", cost=450.0, service_date=datetime.date.today() - datetime.timedelta(days=1), status="completed", vehicle_id=vehicles_dict["CON-099"].id)
            ]
            session.add_all(maintenance_logs)
            print("Seeded 10 maintenance logs.")

        # 8. Seed 10 Expenses
        stmt = select(Expense).limit(1)
        res = await session.execute(stmt)
        if not res.scalars().first():
            expenses = [
                Expense(category="toll", description="I-90 expressway toll fee", amount=120.0, expense_date=datetime.date.today() - datetime.timedelta(days=15), vehicle_id=vehicles_dict["ABC-1234"].id),
                Expense(category="insurance", description="Yearly insurance premium share", amount=24500.0, expense_date=datetime.date.today() - datetime.timedelta(days=14), vehicle_id=vehicles_dict["XYZ-5678"].id),
                Expense(category="toll", description="Highway toll tax gate", amount=350.0, expense_date=datetime.date.today() - datetime.timedelta(days=13), vehicle_id=vehicles_dict["TSLA-0441"].id),
                Expense(category="permit", description="State permit clearance certificate", amount=4500.0, expense_date=datetime.date.today() - datetime.timedelta(days=12), vehicle_id=vehicles_dict["VLV-1832"].id),
                Expense(category="toll", description="Flyover toll clearance tax", amount=180.0, expense_date=datetime.date.today() - datetime.timedelta(days=10), vehicle_id=vehicles_dict["FRT-4491"].id),
                Expense(category="other", description="Emergency engine oil top-up", amount=650.0, expense_date=datetime.date.today() - datetime.timedelta(days=8), vehicle_id=vehicles_dict["VAN-012"].id),
                Expense(category="toll", description="Depot entry checkpoint fee", amount=80.0, expense_date=datetime.date.today() - datetime.timedelta(days=6), vehicle_id=vehicles_dict["VAN-005"].id),
                Expense(category="insurance", description="Commercial fleet insurance share", amount=18500.0, expense_date=datetime.date.today() - datetime.timedelta(days=5), vehicle_id=vehicles_dict["TSLA-0982"].id),
                Expense(category="permit", description="Inter-state transport cargo tax", amount=3200.0, expense_date=datetime.date.today() - datetime.timedelta(days=3), vehicle_id=vehicles_dict["CON-099"].id),
                Expense(category="other", description="Vehicle clean wash and interior sanitize", amount=450.0, expense_date=datetime.date.today() - datetime.timedelta(days=1), vehicle_id=vehicles_dict["ABC-1234"].id)
            ]
            session.add_all(expenses)
            print("Seeded 10 expenses.")

        await session.commit()
    print("Database seeding of exactly 10 records per table completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
