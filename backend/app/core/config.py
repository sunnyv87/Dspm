"""Application configuration using pydantic-settings."""

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "TechD DSPM"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://dspm:dspm@localhost:5432/dspm"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"
    ELASTICSEARCH_INDEX_PREFIX: str = "dspm"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_CONSUMER_GROUP: str = "dspm-workers"

    # Encryption
    CREDENTIAL_ENCRYPTION_KEY: str = "change-me-generate-fernet-key"

    # Scanning
    MAX_SCAN_WORKERS: int = 10
    SCAN_SAMPLE_SIZE: int = 1000
    MAX_FILE_SIZE_MB: int = 100
    SCAN_TIMEOUT_SECONDS: int = 3600

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Logging
    LOG_LEVEL: str = "INFO"
    SIEM_FORWARD_URL: Optional[str] = None

    # Object Storage (for scan artifacts)
    ARTIFACT_STORAGE_BACKEND: str = "local"  # local | s3
    ARTIFACT_STORAGE_PATH: str = "/data/artifacts"
    ARTIFACT_S3_BUCKET: Optional[str] = None

    model_config = {"env_prefix": "DSPM_", "env_file": ".env", "case_sensitive": True}


settings = Settings()
