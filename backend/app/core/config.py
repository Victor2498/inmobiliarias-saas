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
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "inmobiliaria")
    
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis (Rate Limiting / Session)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # Integraciones
    EVOLUTION_API_URL: str = os.getenv("EVOLUTION_API_URL", "https://apievolution.agentech.ar")
    EVOLUTION_API_TOKEN: str = os.getenv("EVOLUTION_API_TOKEN") # Cambiado para coincidir con captura
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    class Config:
        case_sensitive = True

settings = Settings()
