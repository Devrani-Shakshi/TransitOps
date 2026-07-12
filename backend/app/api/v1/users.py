import uuid
import re
from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user, RoleChecker
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role
from app.models.audit_log import AuditLog
from app.schemas.user import UserAdminCreate, UserResponse
from app.services.email_service import email_service
from app.utils.response_envelope import success_response

router = APIRouter()

# Server-side mobile phone number validation regex: 
# expects exactly 10 digits, or typical international formats (e.g. +1234567890)
MOBILE_REGEX = re.compile(r"^\+?([0-9]{1,4})?[-.\s]?([0-9]{10})$")

@router.get("/")
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN"]))
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.role))
        .filter(User.is_deleted == False)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    
    data = []
    for u in users:
        data.append({
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "mobile_number": u.mobile_number,
            "gender": u.gender,
            "must_change_password": u.must_change_password,
            "email_status": u.email_status,
            "is_active": u.is_active,
            "role_id": str(u.role_id) if u.role_id else None,
            "role_name": u.role.name if u.role else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None
        })
        
    return success_response(data=data)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserAdminCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN"]))
):
    # 1. Validate email format & uniqueness
    existing_user = await db.execute(select(User).filter(User.email == user_in.email))
    if existing_user.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists"
        )

    # 2. Validate mobile format
    mobile = user_in.mobile_number.strip().replace(" ", "").replace("-", "")
    if not MOBILE_REGEX.match(mobile) and not (mobile.isdigit() and len(mobile) == 10):
        raise HTTPException(
            status_code=400,
            detail="Invalid mobile number format. Must be a valid mobile number (e.g. exactly 10 digits)."
        )

    # 3. Match Role in Database (case-insensitively)
    role_name_in = user_in.role.upper().strip()
    # Map 'DISPATCHER' or 'dispatcher' to DISPATCHER
    if role_name_in == "DISPATCHER":
        role_name_in = "DISPATCHER"
    
    role_res = await db.execute(select(Role).filter(Role.name == role_name_in))
    role_obj = role_res.scalars().first()
    if not role_obj:
        raise HTTPException(
            status_code=400,
            detail=f"Selected role '{user_in.role}' does not exist in the system"
        )

    # 4. Create password (which is the mobile number) & Hash
    password_hash = get_password_hash(user_in.mobile_number)

    # 5. Save new User
    new_user = User(
        email=user_in.email,
        hashed_password=password_hash,
        full_name=user_in.full_name,
        mobile_number=user_in.mobile_number,
        gender=user_in.gender,
        must_change_password=True,
        email_status="PENDING",
        is_active=True,
        is_superuser=(role_name_in == "ADMIN"),
        role_id=role_obj.id
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 6. Log the audit event
    audit_entry = AuditLog(
        action="user_created",
        resource_type="User",
        resource_id=str(new_user.id),
        details=f"Admin created user {new_user.email} with role {role_obj.name}",
        user_id=current_user.id
    )
    db.add(audit_entry)
    await db.commit()

    # 7. Queue welcome email
    background_tasks.add_task(email_service.send_welcome_email, db, new_user.id)

    response_data = {
        "id": str(new_user.id),
        "email": new_user.email,
        "full_name": new_user.full_name,
        "mobile_number": new_user.mobile_number,
        "gender": new_user.gender,
        "must_change_password": new_user.must_change_password,
        "email_status": new_user.email_status,
        "is_active": new_user.is_active,
        "role_id": str(new_user.role_id),
        "role_name": role_obj.name,
        "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
        "updated_at": new_user.updated_at.isoformat() if new_user.updated_at else None
    }

    return success_response(data=response_data, status_code=status.HTTP_201_CREATED)

@router.post("/{user_id}/resend")
async def resend_credentials(
    user_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN"]))
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.role))
        .filter(User.id == user_id, User.is_deleted == False)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.email_status = "PENDING"
    await db.commit()

    # Queue welcome email
    background_tasks.add_task(email_service.send_welcome_email, db, user.id)

    response_data = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "mobile_number": user.mobile_number,
        "gender": user.gender,
        "must_change_password": user.must_change_password,
        "email_status": user.email_status,
        "is_active": user.is_active,
        "role_id": str(user.role_id) if user.role_id else None,
        "role_name": user.role.name if user.role else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

    return success_response(data=response_data)

@router.post("/{user_id}/toggle-active")
async def toggle_active(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["ADMIN"]))
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.role))
        .filter(User.id == user_id, User.is_deleted == False)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot deactivate their own account")

    user.is_active = not user.is_active
    await db.commit()

    # Log action
    action = "user_activated" if user.is_active else "user_deactivated"
    audit_entry = AuditLog(
        action=action,
        resource_type="User",
        resource_id=str(user.id),
        details=f"Admin toggled active status of {user.email} to {user.is_active}",
        user_id=current_user.id
    )
    db.add(audit_entry)
    await db.commit()

    response_data = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "mobile_number": user.mobile_number,
        "gender": user.gender,
        "must_change_password": user.must_change_password,
        "email_status": user.email_status,
        "is_active": user.is_active,
        "role_id": str(user.role_id) if user.role_id else None,
        "role_name": user.role.name if user.role else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

    return success_response(data=response_data)
