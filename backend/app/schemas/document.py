from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class DocumentBase(BaseModel):
    original_name: str
    file_type: str
    file_size: float


class DocumentResponse(DocumentBase):
    id: int
    filename: str
    summary: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    document_id: Optional[int] = None


class ChatMessage(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []


class SummaryResponse(BaseModel):
    document_id: int
    summary: str
    key_points: List[str] = []