import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Trash2, Sparkles, Loader2, Upload, Clock, HardDrive,
  MessageSquare, ChevronRight, Database,
} from 'lucide-react';
import { listDocuments, deleteDocument, summarizeDocument } from '../api/client';
import type { Document, SummaryResponse } from '../types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState<number | null>(null);
  const [summaryData, setSummaryData] = useState<Record<number, SummaryResponse>>({});

  useEffect(() => { fetchDocuments(); }, []);

  async function fetchDocuments() {
    try {
      const data = await listDocuments();
      setDocuments(data.documents);
    } catch (err) { console.error('Failed to fetch:', err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) { console.error('Delete failed:', err); }
  }

  async function handleSummarize(id: number) {
    setSummarizing(id);
    try {
      const data = await summarizeDocument(id);
      setSummaryData(prev => ({ ...prev, [id]: data }));
    } catch (err) { console.error('Summarize failed:', err); }
    finally { setSummarizing(null); }
  }

  const fileTypeColors: Record<string, string> = {
    '.pdf': 'from-red-500 to-orange-500',
    '.txt': 'from-blue-500 to-cyan-500',
    '.csv': 'from-green-500 to-emerald-500',
    '.docx': 'from-indigo-500 to-purple-500',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-gray-500">Loading your documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-24 animate-slide-up">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl" />
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700">
            <FileText className="w-16 h-16 text-gray-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3">No documents yet</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Upload your first document to unlock AI-powered analysis, chat, and insights.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          <Upload className="w-5 h-5" />
          Upload Your First Document
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Your <span className="text-gradient">Documents</span>
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <Database className="w-4 h-4" />
            {documents.length} document{documents.length !== 1 ? 's' : ''} indexed
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Link>
      </div>

      {/* Document Grid */}
      <div className="grid gap-4">
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className="glass-card rounded-2xl p-6 animate-slide-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${fileTypeColors[doc.file_type] || 'from-gray-500 to-gray-600'} shadow-lg`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">{doc.original_name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {doc.file_size} MB
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {doc.chunk_count} chunks
                    </span>
                    <span className="bg-white/5 text-gray-400 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                      {doc.file_type.replace('.', '')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/chat?doc=${doc.id}`}
                  className="flex items-center gap-1.5 text-sm bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 px-4 py-2 rounded-lg transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Link>
                <button
                  onClick={() => handleSummarize(doc.id)}
                  disabled={summarizing === doc.id}
                  className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-indigo-300 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {summarizing === doc.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Summarize
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Summary Accordion */}
            {summaryData[doc.id] && (
              <div className="mt-5 p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl border border-indigo-500/10 animate-slide-up">
                <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Summary
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {summaryData[doc.id].summary}
                </p>
                {summaryData[doc.id].key_points.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Points</h5>
                    {summaryData[doc.id].key_points.map((point, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {point}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}