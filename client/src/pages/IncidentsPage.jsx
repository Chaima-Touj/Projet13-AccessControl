import { useEffect, useState } from 'react';
import { incidentsAPI, logsAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useI18n } from '../i18n/I18nProvider';

function IncidentModal({ incident, logs, onClose, onSaved }) {
  const editing = !!incident?._id;
  const [form, setForm] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    severity: incident?.severity || 'medium',
    status: incident?.status || 'open',
    relatedAccessLogId: incident?.relatedAccessLogId?._id || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, relatedAccessLogId: form.relatedAccessLogId || null };
      if (editing) await incidentsAPI.update(incident._id, payload);
      else await incidentsAPI.create(payload);
      toast.success(editing ? 'Incident mis à jour' : 'Incident créé');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">{editing ? "Modifier l'incident" : 'Nouvel incident'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Titre *</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div><label className="label">Description *</label><textarea className="input resize-none h-24" value={form.description} onChange={e => set('description', e.target.value)} required /></div>
          <div className="form-row">
            <div>
              <label className="label">Sévérité</label>
              <select className="select" value={form.severity} onChange={e => set('severity', e.target.value)}>
                <option value="low">Faible</option><option value="medium">Moyen</option>
                <option value="high">Élevé</option><option value="critical">Critique</option>
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="open">Ouvert</option><option value="investigating">En cours</option><option value="resolved">Résolu</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Log d'accès lié (optionnel)</label>
            <select className="select" value={form.relatedAccessLogId} onChange={e => set('relatedAccessLogId', e.target.value)}>
              <option value="">— Aucun —</option>
              {logs.slice(0, 50).map(l => (
                <option key={l._id} value={l._id}>
                  {new Date(l.createdAt).toLocaleString('fr-FR')} — {l.userId?.fullName} — {l.result}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IncidentsPage() {
  const { t } = useI18n();
  const [incidents, setIncidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const [ir, lr] = await Promise.all([
        incidentsAPI.getAll(params),
        logsAPI.getAll({ limit: 50 })
      ]);
      setIncidents(ir.data.data.incidents);
      setLogs(lr.data.data);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [statusFilter, severityFilter]);

  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      await incidentsAPI.delete(confirm.id);
      toast.success('Incident supprimé');
      setConfirm(null);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setConfirmLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">{t('modules.incidents')}</h1><p className="page-subtitle">{t('modules.incidentsSubtitle')}</p></div>
        <button className="btn-primary" onClick={() => setModal('create')}><Plus size={16} /> Nouvel incident</button>
      </div>
      <div className="card mb-4">
        <div className="flex gap-3 flex-wrap">
          <select className="select w-full sm:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="investigating">En cours</option>
            <option value="resolved">Résolu</option>
          </select>
          <select className="select w-full sm:w-44" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="">Toutes sévérités</option>
            <option value="low">Faible</option><option value="medium">Moyen</option>
            <option value="high">Élevé</option><option value="critical">Critique</option>
          </select>
        </div>
      </div>
      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Titre</th><th>Sévérité</th><th>Statut</th><th>Créé par</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {incidents.length === 0 && <tr><td colSpan={6}><EmptyState icon={AlertTriangle} title="Aucun incident" /></td></tr>}
                {incidents.map(inc => (
                  <tr key={inc._id}>
                    <td>
                      <p className="font-medium text-slate-200">{inc.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{inc.description}</p>
                    </td>
                    <td><StatusBadge value={inc.severity} type="severity" /></td>
                    <td><StatusBadge value={inc.status} type="incidentStatus" /></td>
                    <td>{inc.createdBy?.fullName || '—'}</td>
                    <td className="text-xs text-slate-500">{new Date(inc.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" onClick={() => setModal(inc)}><Pencil size={14} /></button>
                        <button className="btn-ghost p-1.5 text-red-400" onClick={() => setConfirm({ id: inc._id })}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <IncidentModal incident={modal === 'create' ? null : modal} logs={logs} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchAll(); }} />}
      <ConfirmModal isOpen={!!confirm} title="Supprimer l'incident" message="Supprimer cet incident ?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={confirmLoading} />
    </div>
  );
}

export default IncidentsPage;
