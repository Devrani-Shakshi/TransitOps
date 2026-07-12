import uuid
import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.websocket.connection_manager import manager

class NotificationService:
    async def create_notification(
        self, db: AsyncSession, *, title: str, message: str, notification_type: str = "info", user_id: uuid.UUID | None = None
    ) -> Notification:
        notif = Notification(
            title=title,
            message=message,
            notification_type=notification_type,
            user_id=user_id,
            is_read=False
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)

        # Notify via WebSocket
        payload = {
            "event": "notification",
            "data": {
                "id": str(notif.id),
                "title": notif.title,
                "message": notif.message,
                "notification_type": notif.notification_type,
                "user_id": str(notif.user_id) if notif.user_id else None,
                "is_read": notif.is_read
            }
        }
        message_str = json.dumps(payload)
        
        if user_id:
            # Send to specific user
            await manager.send_personal_message(message_str, str(user_id))
        else:
            # Broadcast to all
            await manager.broadcast(message_str)

        return notif

    async def get_user_notifications(self, db: AsyncSession, *, user_id: uuid.UUID, limit: int = 50) -> list[Notification]:
        # Fetch notifications that are either targetted to this user or system-wide (user_id is Null)
        query = select(Notification).filter(
            (Notification.user_id == user_id) | (Notification.user_id == None)
        ).order_by(Notification.created_at.desc()).limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())

    async def mark_as_read(self, db: AsyncSession, *, notification_id: uuid.UUID) -> Notification | None:
        result = await db.execute(select(Notification).filter(Notification.id == notification_id))
        notif = result.scalars().first()
        if notif:
            notif.is_read = True
            db.add(notif)
            await db.commit()
            await db.refresh(notif)
        return notif

notification_service = NotificationService()
