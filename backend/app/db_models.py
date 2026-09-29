from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class User(Base):
    __tablename__ = "user"

    id:Mapped[int] = mapped_column(primary_key = True)
    username:Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash:Mapped[str] = mapped_column(String(250), nullable=False)
    role:Mapped[str] = mapped_column(String(100), nullable=False, default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)