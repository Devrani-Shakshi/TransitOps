from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.models.maintenance_log import MaintenanceLog
from app.schemas.analytics import FleetAnalyticsSummary, FleetHealthScore, FleetROIMetrics

class AnalyticsService:
    async def get_analytics_summary(self, db: AsyncSession) -> FleetAnalyticsSummary:
        # 1. Health Score Metrics
        total_veh_res = await db.execute(select(func.count(Vehicle.id)).filter(Vehicle.is_deleted == False))
        total_vehicles = total_veh_res.scalar() or 0

        active_veh_res = await db.execute(select(func.count(Vehicle.id)).filter(Vehicle.status == "active", Vehicle.is_deleted == False))
        active_vehicles = active_veh_res.scalar() or 0

        maint_veh_res = await db.execute(select(func.count(Vehicle.id)).filter(Vehicle.status == "maintenance", Vehicle.is_deleted == False))
        under_maintenance = maint_veh_res.scalar() or 0

        oos_veh_res = await db.execute(select(func.count(Vehicle.id)).filter(Vehicle.status == "out_of_service", Vehicle.is_deleted == False))
        out_of_service = oos_veh_res.scalar() or 0

        health_score = (active_vehicles / total_vehicles * 100.0) if total_vehicles > 0 else 100.0

        health = FleetHealthScore(
            score=health_score,
            total_vehicles=total_vehicles,
            active_vehicles=active_vehicles,
            under_maintenance=under_maintenance,
            out_of_service=out_of_service
        )

        # 2. ROI Metrics & Fuel / Distance
        # Distance covered
        dist_res = await db.execute(select(func.sum(Trip.actual_distance)).filter(Trip.status == "completed", Trip.is_deleted == False))
        total_distance = dist_res.scalar() or 0.0

        # Fuel Consumed & Cost
        fuel_res = await db.execute(select(func.sum(FuelLog.gallons), func.sum(FuelLog.cost)).filter(FuelLog.is_deleted == False))
        fuel_row = fuel_res.first()
        total_fuel = fuel_row[0] or 0.0 if fuel_row else 0.0
        total_fuel_cost = fuel_row[1] or 0.0 if fuel_row else 0.0

        # Expenses (category toll, parking, insurance, fuel, maintenance, salary, other)
        exp_res = await db.execute(select(func.sum(Expense.amount)).filter(Expense.is_deleted == False))
        total_expenses_direct = exp_res.scalar() or 0.0

        # Maintenance costs
        maint_cost_res = await db.execute(select(func.sum(MaintenanceLog.cost)).filter(MaintenanceLog.is_deleted == False))
        total_maint_cost = maint_cost_res.scalar() or 0.0

        # Calculate Total Expenses
        total_expenses = total_expenses_direct + total_fuel_cost + total_maint_cost

        # Revenue: assuming a rate of $2.50 per mile completed
        total_revenue = total_distance * 2.50
        net_profit = total_revenue - total_expenses
        roi_pct = (net_profit / total_expenses * 100.0) if total_expenses > 0 else 0.0

        roi = FleetROIMetrics(
            total_revenue=total_revenue,
            total_expenses=total_expenses,
            net_profit=net_profit,
            roi_percentage=roi_pct
        )

        # MPG efficiency
        efficiency = (total_distance / total_fuel) if total_fuel > 0 else 0.0

        return FleetAnalyticsSummary(
            health=health,
            roi=roi,
            total_distance_covered=total_distance,
            total_fuel_consumed=total_fuel,
            fuel_efficiency_mpg=efficiency
        )

analytics_service = AnalyticsService()
