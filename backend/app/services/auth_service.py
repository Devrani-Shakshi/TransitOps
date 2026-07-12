from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.repositories.user_repository import user_repository
from app.models.user import User
from app.core.exceptions import CoreException

class AuthService:
    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> User:
        user = await user_repository.get_by_email(db, email=email)
        if not user:
            raise CoreException("Incorrect email or password", status_code=400)
        if not user.is_active:
            raise CoreException("Inactive user", status_code=400)
        if not verify_password(password, user.hashed_password):
            raise CoreException("Incorrect email or password", status_code=400)
        return user

    async def register(self, db: AsyncSession, *, email: str, password: str, full_name: str | None = None, role_id = None) -> User:
        existing = await user_repository.get_by_email(db, email=email)
        if existing:
            raise CoreException("Email already registered", status_code=400)
        
        user_data = {
            "email": email,
            "hashed_password": get_password_hash(password),
            "full_name": full_name,
            "role_id": role_id,
            "is_active": True,
            "is_superuser": False
        }
        return await user_repository.create(db, obj_in=user_data)

auth_service = AuthService()
