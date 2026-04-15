"""AI service using Google Gemini for summarization and RAG Q&A."""

import google.generativeai as genai
from app.core.config import settings
from app.services.vector_store import vector_store

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")


async def summarize_document(content: str) -> dict:
    max_chars = 30000
    truncated = content[:max_chars] if len(content) > max_chars else content

    prompt = f"""Analyze the following document and provide:
1. A clear, concise summary (3-5 sentences)
2. 5-7 key points or takeaways as a bullet list

Document:
---
{truncated}
---

Respond in this exact format:
SUMMARY:
<your summary here>

KEY POINTS:
- <point 1>
- <point 2>
- <point 3>
(continue as needed)"""

    response = model.generate_content(prompt)
    text = response.text

    summary = ""
    key_points = []

    if "SUMMARY:" in text and "KEY POINTS:" in text:
        parts = text.split("KEY POINTS:")
        summary = parts[0].replace("SUMMARY:", "").strip()
        points_text = parts[1].strip()
        key_points = [
            point.strip().lstrip("- ").strip()
            for point in points_text.split("\n")
            if point.strip() and point.strip() != "-"
        ]
    else:
        summary = text.strip()

    return {"summary": summary, "key_points": key_points}


async def chat_with_document(query: str, document_id: int | None = None) -> dict:
    search_results = vector_store.search(query=query, document_id=document_id, n_results=5)

    if search_results:
        context_parts = []
        sources = []
        for i, result in enumerate(search_results, 1):
            context_parts.append(f"[Source {i}]: {result['content']}")
            sources.append(result["content"][:200] + "...")
        context = "\n\n".join(context_parts)

        prompt = f"""You are NexusAI, an intelligent document analysis assistant.
Answer the user's question based ONLY on the provided context from their documents.
If the context doesn't contain enough information to answer, say so honestly.

Context from documents:
---
{context}
---

User's question: {query}

Provide a clear, helpful answer. Reference specific parts of the documents when possible."""
    else:
        sources = []
        prompt = f"""You are NexusAI, an intelligent document analysis assistant.
The user hasn't uploaded any documents yet, or no relevant content was found.

User's question: {query}

Let them know they should upload documents first, or rephrase their question.
Be helpful and suggest what kinds of documents would be useful."""

    response = model.generate_content(prompt)
    return {"answer": response.text, "sources": sources}