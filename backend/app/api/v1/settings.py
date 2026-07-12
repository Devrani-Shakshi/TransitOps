from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.schemas.settings import SystemSettings
from app.utils.response_envelope import success_response

router = APIRouter()

# Simple global config in-memory state
current_settings = SystemSettings(
    app_name="Core Fleet Management API",
    maintenance_alert_threshold_days=15,
    license_expiry_alert_threshold_days=30,
    default_currency="USD",
    enable_notifications=True
)

@router.get("/")
async def get_settings(current_user = Depends(get_current_user)):
    return success_response(data=current_settings.model_dump(mode="json"))

@router.put("/")
async def update_settings(settings_in: SystemSettings, current_user = Depends(get_current_user)):
    global current_settings
    current_settings = settings_in
    return success_response(data=current_settings.model_dump(mode="json"))
