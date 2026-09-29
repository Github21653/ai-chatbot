from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from contextlib import asynccontextmanager
from sqlalchemy import select
from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.db_models import User
from app.auth import hash_password
from app.routers import auth, chat
from app.security import limiter


settings = get_settings()

def bootstrap():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.role == "superadmin"))
        if not existing:
            db.add(User(
                username=settings.superadmin_username,
                password_hash=hash_password(settings.superadmin_password),
                role="superadmin",
            ))
            db.commit()
            print(f"[bootstrap] created superadmin '{settings.superadmin_username}'")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    bootstrap()
    yield

app = FastAPI(title="Generic AI Chatbot API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}