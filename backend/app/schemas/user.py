import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str
    role_id: uuid.UUID | None = None

class UserAdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    gender: str
    role: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None
    role_id: uuid.UUID | None = None

class UserResponse(UserBase):
    id: uuid.UUID
    mobile_number: str | None = None
    gender: str | None = None
    must_change_password: bool = True
    email_status: str = "PENDING"
    role_id: uuid.UUID | None = None
    role_name: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
