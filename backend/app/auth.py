from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, Cookie
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.db_models import User

settings = get_settings()
COOKIE_NAME = "auth_token"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> str:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False
    
def create_access_token(user:User) -> str:
    now = datetime.now(tz=timezone.utc)
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes)
    }   
    return jwt.encode(payload=payload, key=settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_token(token:str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidKeyError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(
        auth_token: Optional[str] = Cookie(default=None),
        db:Session = Depends(get_db)
        ) -> User:
    if not auth_token:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    payload = decode_token(auth_token)
    user = db.get(User, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_superadmin(user: User = Depends(get_current_user)) -> User:
    if user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return user
