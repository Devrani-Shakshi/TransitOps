from datetime import datetime, timezone, timedelta
import jwt
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db
from app.core.exceptions import CoreException
from app.core.security import create_access_token, create_refresh_token, ALGORITHM
from app.core.config import settings
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import auth_service
from app.utils.response_envelope import success_response

router = APIRouter()

@router.post("/register")
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register(
        db, 
        email=user_in.email, 
        password=user_in.password, 
        full_name=user_in.full_name, 
        role_id=user_in.role_id
    )
    user_res = UserResponse.model_validate(user)
    return success_response(data=user_res.model_dump(mode="json"), status_code=status.HTTP_201_CREATED)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await auth_service.authenticate(db, email=form_data.username, password=form_data.password)
    
    role_name = user.role.name if user.role else None
    access_token = create_access_token(subject=user.id, role=role_name)
    refresh_token = create_refresh_token(subject=user.id)
    
    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(token=refresh_token, user_id=user.id, expires_at=expires_at)
    db.add(db_refresh)
    await db.commit()
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    # 1. Verify in database
    result = await db.execute(select(RefreshToken).filter(RefreshToken.token == refresh_token))
    db_token = result.scalars().first()
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid refresh token")
        
    if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await db.delete(db_token)
        await db.commit()
        raise HTTPException(status_code=400, detail="Refresh token expired")

    # 2. Decode JWT
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        import uuid
        user_id = uuid.UUID(payload.get("sub"))
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid refresh token")

    # 3. Retrieve user
    user_res = await db.execute(select(User).filter(User.id == user_id, User.is_deleted == False))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    role_name = user.role.name if user.role else None
    new_access_token = create_access_token(subject=user.id, role=role_name)
    new_refresh_token = create_refresh_token(subject=user.id)

    # 4. Rotate refresh token
    await db.delete(db_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_db_token = RefreshToken(token=new_refresh_token, user_id=user.id, expires_at=expires_at)
    db.add(new_db_token)
    await db.commit()

    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
