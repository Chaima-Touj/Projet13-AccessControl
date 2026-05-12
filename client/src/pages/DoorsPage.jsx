import { useEffect, useState } from 'react';
import { doorsAPI, buildingsAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, DoorOpen, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useI18n } from '../i18n/I18nProvider';

function DoorModal({ door, buildings, onClose, onSaved }) {
  const editing = !!door?._id;
  const [form, setForm] = useState({
    name: door?.name || '', code: door?.code || '',
    buildingId: door?.buildingId?._id || door?.buildingId || '',
    location: door?.location || '', status: door?.status || 'active',
    securityLevel: door?.securityLevel || 'low'
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) await doorsAPI.update(door._id, form);
      else await doorsAPI.create(form);
      toast.success(editing ? 'Porte mise à jour' : 'Porte créée');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">{editing ? 'Modifier la porte' : 'Nouvelle porte'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-row">
            <div><label className="label">Nom *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div><label className="label">Code *</label><input className="input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required /></div>
          </div>
          <div className="form-row">
            <div>
              <label className="label">Bâtiment *</label>
              <select className="select" value={form.buildingId} onChange={e => set('buildingId', e.target.value)} required>
                <option value="">Sélectionner...</option>
                {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div><label className="label">Emplacement</label><input className="input" value={form.location} onChange={e => set('location', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div>
              <label className="label">Statut</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Actif</option><option value="inactive">Inactif</option>
              </select>
            </div>
            <div>
              <label className="label">Niveau de sécurité</label>
              <select className="select" value={form.securityLevel} onChange={e => set('securityLevel', e.target.value)}>
                <option value="low">Faible</option><option value="medium">Moyen</option><option value="high">Élevé</option>
              </select>
            </div>
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

function DoorsPage() {
  const { t } = useI18n();
  const [doors, setDoors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dr, br] = await Promise.all([doorsAPI.getAll({ buildingId: buildingFilter || undefined }), buildingsAPI.getAll()]);
      setDoors(dr.data.data.doors);
      setBuildings(br.data.data.buildings);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [buildingFilter]);

  const handleDelete = async () => {
    setConfirmLoading(true);
    try { await doorsAPI.delete(confirm.id); toast.success('Porte supprimée'); setConfirm(null); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setConfirmLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">{t('modules.doors')}</h1><p className="page-subtitle">{t('modules.doorsSubtitle')}</p></div>
        <button className="btn-primary" onClick={() => setModal('create')}><Plus size={16} /> Nouvelle porte</button>
      </div>

      <div className="card mb-4">
        <select className="select w-full sm:w-56" value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}>
          <option value="">Tous les bâtiments</option>
          {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Nom</th><th>Code</th><th>Bâtiment</th><th>Emplacement</th><th>Sécurité</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {doors.length === 0 && <tr><td colSpan={7}><EmptyState icon={DoorOpen} title="Aucune porte trouvée" /></td></tr>}
                {doors.map(d => (
                  <tr key={d._id}>
                    <td className="font-medium text-slate-200">{d.name}</td>
                    <td><code className="text-xs bg-slate-800 px-2 py-0.5 rounded">{d.code}</code></td>
                    <td>{d.buildingId?.name || '—'}</td>
                    <td className="text-slate-400">{d.location || '—'}</td>
                    <td><StatusBadge value={d.securityLevel} type="securityLevel" /></td>
                    <td><StatusBadge value={d.status} type="doorStatus" /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" onClick={() => setModal(d)}><Pencil size={14} /></button>
                        <button className="btn-ghost p-1.5 text-red-400" onClick={() => setConfirm({ id: d._id, name: d.name })}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <DoorModal door={modal === 'create' ? null : modal} buildings={buildings} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchAll(); }} />}
      <ConfirmModal isOpen={!!confirm} title="Supprimer la porte" message={`Supprimer "${confirm?.name}" ?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={confirmLoading} />
    </div>
  );
}

export default DoorsPage;
