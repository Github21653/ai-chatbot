from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    openrouter_api_key : str
    openrouter_model : str
    openrouter_fallbacks: str = "meta-llama/llama-3.3-70b-instruct:free,google/gemma-3-27b-it:free"
    openrouter_base_url : str
    allowed_origins : str = "http://localhost:3000"

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    # Bootstrap superadmin
    superadmin_username: str = "admin"
    superadmin_password: str = "admin123"

    # DB
    database_url: str = "sqlite:///./chatbot.db"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

