import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-black text-slate-800 mb-4">404</p>
        <div className="inline-flex w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl items-center justify-center mb-6">
          <Search size={28} className="text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Page Introuvable</h1>
        <p className="text-slate-400 mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
