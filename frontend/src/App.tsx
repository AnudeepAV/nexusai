import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}