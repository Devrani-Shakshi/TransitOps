from pydantic import BaseModel

class SystemSettings(BaseModel):
    app_name: str
    maintenance_alert_threshold_days: int = 15
    license_expiry_alert_threshold_days: int = 30
    default_currency: str = "USD"
    enable_notifications: bool = True
