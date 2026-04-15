"""Integration tests for API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_documents_empty(client: AsyncClient):
    """Test listing documents when empty."""
    response = await client.get("/api/documents/")
    assert response.status_code == 200
    data = response.json()
    assert "documents" in data
    assert "total" in data
    assert isinstance(data["documents"], list)
    assert len(data["documents"]) == 0


@pytest.mark.asyncio
async def test_get_nonexistent_document(client: AsyncClient):
    """Test getting a non-existent document returns 404."""
    response = await client.get("/api/documents/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_upload_invalid_file_type(client: AsyncClient):
    """Test uploading an invalid file type returns 400."""
    response = await client.post(
        "/api/documents/upload",
        files={"file": ("malware.exe", b"bad content", "application/octet-stream")},
    )
    assert response.status_code == 400
    assert "not supported" in response.json()["detail"]