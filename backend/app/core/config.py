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
        # Priorizar DATABASE_URL de entorno
        url = os.getenv("DATABASE_URL")
        if not url:
            url = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        # Corrección de esquema
        url = url.replace("postgres://", "postgresql://")
        
        # Limpieza radical de parámetros (?...)
        # El pooler de Supabase a veces manda pgbouncer=true que rompe a psycopg2
        if "?" in url:
            url = url.split("?")[0]
            
        return url
    
    # Redis (Rate Limiting / Session)
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: str = os.getenv("REDIS_PORT", "6379")
    REDIS_PASSWORD: str | None = os.getenv("REDIS_PASSWORD")
    REDIS_USER: str = os.getenv("REDIS_USER", "default")
    REDIS_URL: str | None = os.getenv("REDIS_URL")

    @property
    def get_redis_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        if self.REDIS_PASSWORD:
            return f"redis://{self.REDIS_USER}:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    # Integraciones
    EVOLUTION_API_URL: str = os.getenv("EVOLUTION_API_URL", "https://apievolution.agentech.ar").rstrip("/")
    EVOLUTION_API_TOKEN: str = os.getenv("EVOLUTION_API_TOKEN")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    class Config:
        case_sensitive = True

settings = Settings()
