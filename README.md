# NexusAI - AI-Powered Document Intelligence Platform

[![CI Pipeline](https://github.com/AnudeepAV/nexusai/actions/workflows/ci.yml/badge.svg)](https://github.com/AnudeepAV/nexusai/actions)

> Upload documents, chat with them using AI, and extract intelligent insights — powered by RAG (Retrieval Augmented Generation).

## Features

- **Document Upload & Processing** — PDF, TXT, CSV, DOCX with automatic text extraction
- **AI-Powered Chat (RAG)** — Ask questions; AI finds relevant sections and generates answers
- **Smart Summarization** — One-click AI summaries with key points via Google Gemini
- **Semantic Search** — ChromaDB vector store for meaning-based search
- **Premium UI** — Glassmorphism design with animations and dark theme

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Python 3.11, FastAPI, SQLAlchemy (async) |
| AI/LLM | Google Gemini 2.0 Flash (free tier) |
| Vector DB | ChromaDB |
| Database | SQLite with aiosqlite |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

## Quick Start

### Prerequisites
- Python 3.11+ | Node.js 20+ | [Gemini API Key](https://aistudio.google.com/apikey) (free)

### Local Development
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Add your GEMINI_API_KEY to backend/.env
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
# Open http://localhost:5173
```

### Docker
```bash
cp .env.example .env  # Add your GEMINI_API_KEY
docker compose up --build
# Open http://localhost
```

## Architecture
React + TypeScript ──> FastAPI ──> Google Gemini
|          (AI/LLM)
|
┌──────┴──────┐
│             │
ChromaDB      SQLite
(Vectors/RAG)   (Metadata)
## API Docs
Visit http://localhost:8000/docs for interactive Swagger UI.

## License
MIT