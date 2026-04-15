import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Zap, Shield} from 'lucide-react';
import { uploadDocument } from '../api/client';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 20, 90));
    }, 300);

    try {
      await uploadDocument(file);
      clearInterval(interval);
      setProgress(100);
      setUploadStatus('success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      clearInterval(interval);
      setUploadStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {/* Hero text */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          Upload Your <span className="text-gradient">Document</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Drop any document and let AI unlock its intelligence
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl p-16 text-center transition-all duration-500 cursor-pointer group ${
          isDragging
            ? 'bg-indigo-500/10 border-2 border-indigo-400 shadow-[0_0_60px_rgba(99,102,241,0.2)]'
            : uploadStatus === 'success'
            ? 'bg-emerald-500/10 border-2 border-emerald-400/50'
            : uploadStatus === 'error'
            ? 'bg-red-500/10 border-2 border-red-400/50'
            : 'glass-card border-2 border-dashed border-gray-700 hover:border-indigo-500/50'
        }`}
      >
        {/* Animated corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-500/30 rounded-br-lg" />

        <input
          type="file"
          accept=".pdf,.txt,.csv,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          {isUploading ? (
            <div>
              <Loader2 className="w-20 h-20 mx-auto text-indigo-400 animate-spin" />
              <p className="mt-6 text-xl font-semibold text-indigo-300">Processing your document...</p>
              <div className="mt-4 w-64 mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Extracting text & creating embeddings...</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div>
              <CheckCircle className="w-20 h-20 mx-auto text-emerald-400" />
              <p className="mt-6 text-xl font-semibold text-emerald-300">Upload successful!</p>
              <p className="mt-2 text-gray-400">Redirecting to your documents...</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div>
              <AlertCircle className="w-20 h-20 mx-auto text-red-400" />
              <p className="mt-6 text-xl font-semibold text-red-300">Upload failed</p>
              <p className="mt-2 text-red-400/70">{errorMessage}</p>
              <p className="mt-3 text-sm text-gray-500">Click to try again</p>
            </div>
          ) : (
            <div>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all" />
                <Upload className="relative w-20 h-20 mx-auto text-gray-500 group-hover:text-indigo-400 transition-colors duration-300" />
              </div>
              <p className="mt-6 text-xl font-semibold text-gray-300 group-hover:text-white transition-colors">
                Drop your file here or click to browse
              </p>
              <p className="mt-2 text-gray-500">
                Supports <span className="text-indigo-400/70">PDF</span>, <span className="text-purple-400/70">TXT</span>, <span className="text-cyan-400/70">CSV</span>, <span className="text-pink-400/70">DOCX</span> (max 10MB)
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {[
          { icon: FileText, title: 'Smart Extraction', desc: 'AI extracts and processes text from any document format', color: 'indigo' },
          { icon: Zap, title: 'Vector Indexing', desc: 'Content is chunked and embedded for instant semantic search', color: 'purple' },
          { icon: Shield, title: 'AI-Ready', desc: 'Chat, summarize, and get insights powered by Gemini', color: 'cyan' },
        ].map(({ icon: Icon, title, desc, color }, idx) => (
          <div
            key={title}
            className="glass-card rounded-xl p-5 animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
