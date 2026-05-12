import { ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl items-center justify-center mb-6">
          <ShieldX size={36} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Accès Refusé</h1>
        <p className="text-slate-400 mb-8">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
