"""Application configuration loaded from environment variables."""

import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "NexusAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    GEMINI_API_KEY: str
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexusai.db"
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt", ".csv", ".docx"]

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Get CORS origins from environment or use defaults."""
        cors_env = os.getenv("CORS_ORIGINS", "")
        if cors_env:
            return [url.strip() for url in cors_env.split(",")]
        # Allow all origins for development/demo
        return ["*"]

    class Config:
        env_file = ".env"


settings = Settings()