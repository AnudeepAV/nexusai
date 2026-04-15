export interface Document {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  summary: string | null;
  chunk_count: number;
  created_at: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface SummaryResponse {
  document_id: number;
  summary: string;
  key_points: string[];
}