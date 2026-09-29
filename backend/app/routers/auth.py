
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    COOKIE_NAME, create_access_token, get_current_user,
    hash_password, require_superadmin, verify_password,
)
from app.config import get_settings
from app.database import get_db
from app.db_models import User
from app.schemas import LoginRequest, RegisterRequest, UserOut
from app.security import limiter

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
@limiter.limit("5/minute")
async def login(request:Request, body:LoginRequest, response:Response, db:Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == body.username))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(user)
    response.set_cookie(
        key = COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,   # ← set to True when serving over HTTPS in production
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )
    return {"id": user.id, "username": user.username, "role": user.role}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}

@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return UserOut(id=user.id, username=user.username, role=user.role)

@router.post("/register")
@limiter.limit("10/minute")
async def register(request:Request, body:RegisterRequest, db:Session = Depends(get_db)):
    if db.scalar(select(User).where(User.username == body.username)):
        raise HTTPException(status_code=409, detail="Username already exists")
    
    new_user = User(
        username = body.username,
        password_hash = hash_password(body.password),
        role = body.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserOut(id=new_user.id, username=new_user.username, role=new_user.role)

@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_superadmin),
):
    users = db.scalars(select(User).order_by(User.id)).all()
    return [UserOut(id=u.id, username=u.username, role=u.role) for u in users]