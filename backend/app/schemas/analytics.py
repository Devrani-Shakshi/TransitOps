from pydantic import BaseModel

class FleetHealthScore(BaseModel):
    score: float
    total_vehicles: int
    active_vehicles: int
    under_maintenance: int
    out_of_service: int

class FleetROIMetrics(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    roi_percentage: float

class FleetAnalyticsSummary(BaseModel):
    health: FleetHealthScore
    roi: FleetROIMetrics
    total_distance_covered: float
    total_fuel_consumed: float
    fuel_efficiency_mpg: float
