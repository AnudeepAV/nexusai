"""NexusAI — AI-Powered Document Intelligence Platform.

A full-stack application enabling users to upload documents,
chat with them using RAG (Retrieval Augmented Generation),
and extract AI-powered summaries and insights.

Built with: FastAPI, Google Gemini, ChromaDB, SQLAlchemy
Author: Anudeep Munagala
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import documents, chat, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-Powered Document Intelligence Platform. "
        "Upload documents, chat with them using RAG, "
        "and generate AI summaries — powered by Google Gemini."
    ),
    lifespan=lifespan,
)

# CORS — allows the React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo/development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routes
app.include_router(health.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")