"""API routes for AI-powered chat with documents."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.document import ChatHistory
from app.schemas.document import ChatRequest, ChatResponse, ChatMessage
from app.services.ai_service import chat_with_document

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    user_msg = ChatHistory(document_id=request.document_id, role="user", content=request.message)
    db.add(user_msg)

    result = await chat_with_document(query=request.message, document_id=request.document_id)

    assistant_msg = ChatHistory(document_id=request.document_id, role="assistant", content=result["answer"])
    db.add(assistant_msg)
    await db.commit()

    return ChatResponse(answer=result["answer"], sources=result["sources"])


@router.get("/history", response_model=list[ChatMessage])
async def get_chat_history(document_id: int | None = None, limit: int = 50, db: AsyncSession = Depends(get_db)):
    query = select(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(limit)
    if document_id is not None:
        query = query.where(ChatHistory.document_id == document_id)
    result = await db.execute(query)
    messages = result.scalars().all()
    return [ChatMessage(role=msg.role, content=msg.content, created_at=msg.created_at) for msg in reversed(messages)]