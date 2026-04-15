import axios from 'axios';
import type {
  DocumentListResponse, Document, ChatResponse, SummaryResponse, ChatMessage,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<Document>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const { data } = await api.get<DocumentListResponse>('/documents/');
  return data;
}

export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function summarizeDocument(id: number): Promise<SummaryResponse> {
  const { data } = await api.post<SummaryResponse>(`/documents/${id}/summarize`);
  return data;
}

export async function sendMessage(message: string, documentId?: number): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat/', { message, document_id: documentId });
  return data;
}

export async function getChatHistory(documentId?: number): Promise<ChatMessage[]> {
  const params = documentId ? { document_id: documentId } : {};
  const { data } = await api.get<ChatMessage[]>('/chat/history', { params });
  return data;
}