from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.services.analytics_service import analytics_service
from app.utils.response_envelope import success_response

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    summary = await analytics_service.get_analytics_summary(db)
    return success_response(data=summary.model_dump(mode="json"))
