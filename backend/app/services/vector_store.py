"""ChromaDB vector store for semantic search (RAG)."""

import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings


class VectorStoreService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"},
        )

    def add_document_chunks(self, document_id: int, chunks: list[str]) -> int:
        if not chunks:
            return 0
        ids = [f"doc_{document_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]
        self.collection.add(documents=chunks, ids=ids, metadatas=metadatas)
        return len(chunks)

    def search(self, query: str, document_id: int | None = None, n_results: int = 5) -> list[dict]:
        where_filter = None
        if document_id is not None:
            where_filter = {"document_id": document_id}
        results = self.collection.query(
            query_texts=[query], n_results=n_results, where=where_filter,
        )
        search_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                search_results.append({
                    "content": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else 0,
                })
        return search_results

    def delete_document(self, document_id: int):
        self.collection.delete(where={"document_id": document_id})


vector_store = VectorStoreService()