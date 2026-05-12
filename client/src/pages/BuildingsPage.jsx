import { useEffect, useState } from 'react';
import { buildingsAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Building2, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useI18n } from '../i18n/I18nProvider';

function BuildingModal({ building, onClose, onSaved }) {
  const editing = !!building?._id;
  const [form, setForm] = useState({ name: building?.name || '', code: building?.code || '', description: building?.description || '', status: building?.status || 'active' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await buildingsAPI.update(building._id, form);
      else await buildingsAPI.create(form);
      toast.success(editing ? 'Bâtiment mis à jour' : 'Bâtiment créé');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">{editing ? 'Modifier le bâtiment' : 'Nouveau bâtiment'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-row">
            <div><label className="label">Nom *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div><label className="label">Code *</label><input className="input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input resize-none h-20" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div><label className="label">Statut</label>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Actif</option><option value="inactive">Inactif</option>
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

function BuildingsPage() {
  const { t } = useI18n();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await buildingsAPI.getAll(); setBuildings(r.data.data.buildings); }
    catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    setConfirmLoading(true);
    try { await buildingsAPI.delete(confirm.id); toast.success('Bâtiment supprimé'); setConfirm(null); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setConfirmLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">{t('modules.buildings')}</h1><p className="page-subtitle">{t('modules.buildingsSubtitle')}</p></div>
        <button className="btn-primary" onClick={() => setModal('create')}><Plus size={16} /> Nouveau bâtiment</button>
      </div>
      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Nom</th><th>Code</th><th>Description</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {buildings.length === 0 && <tr><td colSpan={5}><EmptyState icon={Building2} title="Aucun bâtiment" /></td></tr>}
                {buildings.map(b => (
                  <tr key={b._id}>
                    <td className="font-medium text-slate-200">{b.name}</td>
                    <td><code className="text-xs bg-slate-800 px-2 py-0.5 rounded">{b.code}</code></td>
                    <td className="text-slate-400 max-w-xs truncate">{b.description || '—'}</td>
                    <td><StatusBadge value={b.status} type="buildingStatus" /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" onClick={() => setModal(b)}><Pencil size={14} /></button>
                        <button className="btn-ghost p-1.5 text-red-400" onClick={() => setConfirm({ id: b._id, name: b.name })}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <BuildingModal building={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetch(); }} />}
      <ConfirmModal isOpen={!!confirm} title="Supprimer le bâtiment" message={`Supprimer "${confirm?.name}" ?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={confirmLoading} />
    </div>
  );
}

export default BuildingsPage;
