"""Application configuration loaded from environment variables."""

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
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://nexusai-kta2rvwsp-anudeepavs-projects.vercel.app",
        "https://nexusai.vercel.app",
    ]

    class Config:
        env_file = ".env"


settings = Settings()