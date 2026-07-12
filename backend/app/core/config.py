import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Core Fleet Management API"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "supersecretjwtkeythatis32byteslongatleastforsecurity123!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./fleet_management.db"

    # Redis & Celery
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # SMTP Mail Configuration
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = "user@example.com"
    SMTP_PASSWORD: str = "password"
    EMAILS_FROM_EMAIL: str = "noreply@example.com"
    EMAILS_FROM_NAME: str = "Core Fleet Management"

    # First Superuser
    FIRST_SUPERUSER: str = "admin@transitops.io"
    FIRST_SUPERUSER_PASSWORD: str = "Demo@123"

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:4200"

    # Testing
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"

settings = Settings()
