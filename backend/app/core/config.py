from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "NexusAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API Keys
    GEMINI_API_KEY: str

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexusai.db"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # File uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt", ".csv", ".docx"]

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()