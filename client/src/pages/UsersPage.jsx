import { useEffect, useState } from 'react';
import { usersAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, ToggleLeft, Users } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { X } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const ROLES = ['admin','student','teacher','security'];
const DEPTS = ['Informatique','Mathématiques','Physique','Chimie','Sciences','Sécurité','Administration'];

function UserModal({ user, onClose, onSaved }) {
  const editing = !!user?._id;
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
    department: user?.department || '',
    status: user?.status || 'active',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) await usersAPI.update(user._id, payload);
      else await usersAPI.create(payload);
      toast.success(editing ? 'Utilisateur mis à jour' : 'Utilisateur créé');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">{editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-row">
            <div>
              <label className="label">Nom complet *</label>
              <input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="label">{editing ? 'Nouveau mot de passe (laisser vide)' : 'Mot de passe *'}</label>
              <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} required={!editing} />
            </div>
            <div>
              <label className="label">Département</label>
              <select className="select" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Sélectionner...</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="label">Rôle *</label>
              <select className="select" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {editing && (
              <div>
                <label className="label">Statut</label>
                <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            )}
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

function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | user object
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ search, role: roleFilter, status: statusFilter });
      setUsers(res.data.data);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search, roleFilter, statusFilter]);

  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      await usersAPI.delete(confirm.id);
      toast.success('Utilisateur supprimé');
      setConfirm(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setConfirmLoading(false); }
  };

  const handleToggleStatus = async (u) => {
    try {
      await usersAPI.toggleStatus(u._id);
      toast.success('Statut mis à jour');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{t('modules.users')}</h1>
          <p className="page-subtitle">{t('modules.usersSubtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')}><Plus size={16} /> Nouvel utilisateur</button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9" placeholder={t('form.search')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-full sm:w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">Tous les rôles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="select w-full sm:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Département</th><th>Statut</th><th>Créé le</th><th>Actions</th></tr></thead>
              <tbody>
                {users.length === 0 && <tr><td colSpan={7}><EmptyState icon={Users} title="Aucun utilisateur trouvé" /></td></tr>}
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="font-medium text-slate-200">{u.fullName}</td>
                    <td>{u.email}</td>
                    <td><StatusBadge value={u.role} type="role" /></td>
                    <td>{u.department || '—'}</td>
                    <td><StatusBadge value={u.status} type="userStatus" /></td>
                    <td className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Modifier" onClick={() => setModal(u)}><Pencil size={14} /></button>
                        <button className="btn-ghost p-1.5" title="Changer statut" onClick={() => handleToggleStatus(u)}><ToggleLeft size={14} /></button>
                        <button className="btn-ghost p-1.5 text-red-400 hover:text-red-300" title="Supprimer" onClick={() => setConfirm({ id: u._id, name: u.fullName })}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <UserModal user={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetch(); }} />}
      <ConfirmModal isOpen={!!confirm} title="Supprimer l'utilisateur" message={`Êtes-vous sûr de vouloir supprimer "${confirm?.name}" ?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={confirmLoading} />
    </div>
  );
}

export default UsersPage;
