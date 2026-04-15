import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_documents_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/documents/")
    assert response.status_code == 200
    data = response.json()
    assert "documents" in data


@pytest.mark.asyncio
async def test_get_nonexistent_document():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/documents/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_upload_invalid_file_type():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/documents/upload",
            files={"file": ("test.exe", b"fake", "application/octet-stream")},
        )
    assert response.status_code == 400