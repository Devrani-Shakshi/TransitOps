import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.services.notification_service import notification_service
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.utils.response_envelope import success_response

router = APIRouter()

@router.get("/")
async def list_notifications(limit: int = 50, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    notifs = await notification_service.get_user_notifications(db, user_id=current_user.id, limit=limit)
    data = [NotificationResponse.model_validate(n).model_dump(mode="json") for n in notifs]
    return success_response(data=data)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_notification(notif_in: NotificationCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    notif = await notification_service.create_notification(
        db,
        title=notif_in.title,
        message=notif_in.message,
        notification_type=notif_in.notification_type,
        user_id=notif_in.user_id
    )
    return success_response(data=NotificationResponse.model_validate(notif).model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.post("/{id}/read")
async def mark_notification_read(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    notif = await notification_service.mark_as_read(db, notification_id=id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success_response(data=NotificationResponse.model_validate(notif).model_dump(mode="json"))
