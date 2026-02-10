import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "SaaS Inmobiliario Enterprise"
    API_V1_STR: str = "/api/v1"
    
    # Seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Redis (Rate Limiting / Session)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # Integraciones
    EVOLUTION_API_URL: str = os.getenv("EVOLUTION_API_URL")
    EVOLUTION_API_KEY: str = os.getenv("EVOLUTION_API_KEY")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    class Config:
        case_sensitive = True

settings = Settings()
