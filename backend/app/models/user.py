import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.refresh_token import RefreshToken
    from app.models.audit_log import AuditLog


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mobile_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    role_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=True)

    # Relationships
    role: Mapped["Role | None"] = relationship("Role", back_populates="users")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")
