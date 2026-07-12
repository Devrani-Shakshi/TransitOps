import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. CREATE_VEHICLE, UPDATE_TRIP
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. Vehicle, Trip
    resource_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True) # JSON or key-value change details
    
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")
