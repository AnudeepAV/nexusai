"""API routes for document management."""

import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentListResponse, SummaryResponse
from app.services.document_processor import extract_text, chunk_text
from app.services.vector_store import vector_store
from app.services.ai_service import summarize_document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file_ext}' not supported. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)

    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum: {settings.MAX_FILE_SIZE_MB}MB")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        text_content = extract_text(file_path, file_ext)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=422, detail=f"Could not extract text: {str(e)}")

    doc = Document(
        filename=unique_filename,
        original_name=file.filename,
        file_type=file_ext,
        file_size=round(file_size_mb, 2),
        content=text_content,
    )
    db.add(doc)
    await db.flush()

    chunks = chunk_text(text_content)
    chunk_count = vector_store.add_document_chunks(doc.id, chunks)
    doc.chunk_count = chunk_count

    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/", response_model=DocumentListResponse)
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    documents = result.scalars().all()
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(doc) for doc in documents],
        total=len(documents),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    vector_store.delete_document(document_id)
    file_path = os.path.join(settings.UPLOAD_DIR, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    await db.delete(doc)
    await db.commit()


@router.post("/{document_id}/summarize", response_model=SummaryResponse)
async def summarize(document_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not doc.content:
        raise HTTPException(status_code=422, detail="Document has no extractable content")

    summary_data = await summarize_document(doc.content)
    doc.summary = summary_data["summary"]
    await db.commit()

    return SummaryResponse(
        document_id=doc.id,
        summary=summary_data["summary"],
        key_points=summary_data["key_points"],
    )