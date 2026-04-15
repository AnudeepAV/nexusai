import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, MessageSquare, Upload, Brain, Sparkles } from 'lucide-react';

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Documents', icon: FileText },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/upload', label: 'Upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md group-hover:bg-indigo-500/30 transition-all" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gradient">NexusAI</span>
                <Sparkles className="w-3 h-3 text-indigo-400 animate-float" />
              </div>
            </Link>

            <nav className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}