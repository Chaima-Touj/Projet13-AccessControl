import { useEffect, useState } from 'react';
import { permissionsAPI, usersAPI, buildingsAPI, doorsAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ShieldCheck, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useI18n } from '../i18n/I18nProvider';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function PermissionModal({ permission, users, buildings, doors, onClose, onSaved }) {
  const editing = !!permission?._id;
  const [form, setForm] = useState({
    userId: permission?.userId?._id || '',
    role: permission?.role || '',
    buildingId: permission?.buildingId?._id || '',
    doorId: permission?.doorId?._id || '',
    allowedDays: permission?.allowedDays || [],
    startTime: permission?.startTime || '',
    endTime: permission?.endTime || '',
    status: permission?.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (day) => {
    setForm(f => ({ ...f, allowedDays: f.allowedDays.includes(day) ? f.allowedDays.filter(d => d !== day) : [...f.allowedDays, day] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, userId: form.userId || null, role: form.role || null, buildingId: form.buildingId || null, doorId: form.doorId || null };
      if (editing) await permissionsAPI.update(permission._id, payload);
      else await permissionsAPI.create(payload);
      toast.success(editing ? 'Permission mise à jour' : 'Permission créée');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">{editing ? 'Modifier la permission' : 'Nouvelle permission'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-row">
            <div>
              <label className="label">Utilisateur spécifique</label>
              <select className="select" value={form.userId} onChange={e => { set('userId', e.target.value); if(e.target.value) set('role',''); }}>
                <option value="">— Aucun —</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ou Rôle</label>
              <select className="select" value={form.role} onChange={e => { set('role', e.target.value); if(e.target.value) set('userId',''); }}>
                <option value="">— Aucun —</option>
                <option value="student">Étudiant</option>
                <option value="teacher">Enseignant</option>
                <option value="security">Sécurité</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="label">Bâtiment</label>
              <select className="select" value={form.buildingId} onChange={e => set('buildingId', e.target.value)}>
                <option value="">— Tous —</option>
                {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Porte</label>
              <select className="select" value={form.doorId} onChange={e => set('doorId', e.target.value)}>
                <option value="">— Toutes —</option>
                {doors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Jours autorisés (vide = tous les jours)</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((d, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.allowedDays.includes(i) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div><label className="label">Heure début</label><input type="time" className="input" value={form.startTime} onChange={e => set('startTime', e.target.value)} /></div>
            <div><label className="label">Heure fin</label><input type="time" className="input" value={form.endTime} onChange={e => set('endTime', e.target.value)} /></div>
          </div>
          <div>
            <label className="label">Statut</label>
            <select className="select w-40" value={form.status} onChange={e => set('status', e.target.value)}>
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

function PermissionsPage() {
  const { t } = useI18n();
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pr, ur, br, dr] = await Promise.all([
        permissionsAPI.getAll(), usersAPI.getAll(), buildingsAPI.getAll(), doorsAPI.getAll()
      ]);
      setPermissions(pr.data.data.permissions);
      setUsers(ur.data.data);
      setBuildings(br.data.data.buildings);
      setDoors(dr.data.data.doors);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    setConfirmLoading(true);
    try { await permissionsAPI.delete(confirm.id); toast.success('Permission supprimée'); setConfirm(null); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setConfirmLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">{t('modules.permissions')}</h1><p className="page-subtitle">{t('modules.permissionsSubtitle')}</p></div>
        <button className="btn-primary" onClick={() => setModal('create')}><Plus size={16} /> Nouvelle permission</button>
      </div>
      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Sujet</th><th>Bâtiment</th><th>Porte</th><th>Horaires</th><th>Jours</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {permissions.length === 0 && <tr><td colSpan={7}><EmptyState icon={ShieldCheck} title="Aucune permission" /></td></tr>}
                {permissions.map(p => (
                  <tr key={p._id}>
                    <td>
                      {p.userId ? <span className="text-slate-300">{p.userId.fullName}</span> : null}
                      {p.role ? <StatusBadge value={p.role} type="role" /> : null}
                      {!p.userId && !p.role ? '—' : null}
                    </td>
                    <td>{p.buildingId?.name || <span className="text-slate-500">Tous</span>}</td>
                    <td>{p.doorId?.name || <span className="text-slate-500">Toutes</span>}</td>
                    <td className="text-xs text-slate-400">{p.startTime && p.endTime ? `${p.startTime} – ${p.endTime}` : <span className="text-slate-600">Toute la journée</span>}</td>
                    <td className="text-xs text-slate-400">{p.allowedDays?.length ? p.allowedDays.map(d => DAYS[d]).join(', ') : <span className="text-slate-600">Tous</span>}</td>
                    <td><StatusBadge value={p.status} type="permissionStatus" /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" onClick={() => setModal(p)}><Pencil size={14} /></button>
                        <button className="btn-ghost p-1.5 text-red-400" onClick={() => setConfirm({ id: p._id })}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <PermissionModal permission={modal === 'create' ? null : modal} users={users} buildings={buildings} doors={doors} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchAll(); }} />}
      <ConfirmModal isOpen={!!confirm} title="Supprimer la permission" message="Êtes-vous sûr de vouloir supprimer cette permission ?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={confirmLoading} />
    </div>
  );
}

export default PermissionsPage;
