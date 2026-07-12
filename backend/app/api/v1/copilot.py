from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.services.copilot_service import copilot_service
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.utils.response_envelope import success_response

router = APIRouter()

@router.post("/query")
async def process_copilot_query(req: CopilotQueryRequest, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    res = await copilot_service.process_query(db, query=req.query)
    # Wrap in Pydantic schema
    response_data = CopilotQueryResponse(**res)
    return success_response(data=response_data.model_dump(mode="json"))
