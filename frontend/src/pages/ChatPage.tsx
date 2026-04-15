import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, Loader2, FileText, Sparkles, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessage, getChatHistory, listDocuments } from '../api/client';
import type { ChatMessage, Document } from '../types';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get('doc');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(
    docIdParam ? parseInt(docIdParam) : undefined
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listDocuments().then(data => setDocuments(data.documents));
    loadHistory();
  }, [selectedDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  async function loadHistory() {
    try {
      const history = await getChatHistory(selectedDocId);
      setMessages(history);
    } catch (err) { console.error('Load failed:', err); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage, selectedDocId);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  const suggestions = [
    'Summarize the key points of this document',
    'What are the main findings?',
    'Explain the most important concepts',
    'What conclusions can be drawn?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Document Selector */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="bg-transparent border-none text-sm focus:outline-none text-gray-300 cursor-pointer"
          >
            <option value="" className="bg-gray-900">All documents</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id} className="bg-gray-900">{doc.original_name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {selectedDocId ? 'Chatting with specific document' : 'Searching all documents'}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-6 pb-4 relative"
      >
        {messages.length === 0 && (
          <div className="text-center py-16 animate-slide-up">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse-glow" />
              <div className="relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-2xl border border-indigo-500/20">
                <Bot className="w-12 h-12 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Chat with your <span className="text-gradient">documents</span>
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Ask anything about your uploaded documents. NexusAI uses RAG to find relevant information and generate accurate answers.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-sm bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/20 px-4 py-2 rounded-full transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
            }`}>
              {msg.role === 'user'
                ? <User className="w-4 h-4 text-white" />
                : <Sparkles className="w-4 h-4 text-indigo-400" />
              }
            </div>
            <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                : 'glass-card'
            }`}>
              <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-indigo-300 prose-strong:text-white prose-code:text-indigo-300 prose-code:bg-white/10 prose-code:rounded prose-code:px-1">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-slide-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="glass-card rounded-2xl px-5 py-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-400 typing-dot-1" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 typing-dot-2" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 typing-dot-3" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-24 right-8 bg-indigo-600 text-white p-2 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all animate-fade-in"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-white/5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="w-full glass rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500 text-white"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}