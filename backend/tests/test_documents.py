import pytest
from app.services.document_processor import chunk_text


class TestChunkText:
    def test_empty_text(self):
        assert chunk_text("") == []

    def test_short_text(self):
        chunks = chunk_text("Short text.", chunk_size=1000)
        assert len(chunks) == 1

    def test_long_text_multiple_chunks(self):
        text = "Word " * 500
        chunks = chunk_text(text, chunk_size=500, overlap=100)
        assert len(chunks) > 1