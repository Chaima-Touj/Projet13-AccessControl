import { X } from 'lucide-react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger = true, loading = false }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onCancel} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>Annuler</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'} disabled={loading}>
            {loading ? 'En cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
