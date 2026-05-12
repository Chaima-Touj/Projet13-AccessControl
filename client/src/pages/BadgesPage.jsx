import { useEffect, useState } from 'react';
import { badgesAPI, usersAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Plus, CreditCard, Lock, Unlock, RefreshCw, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useI18n } from '../i18n/I18nProvider';

function CreateBadgeModal({ onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usersAPI.getAll({ status: 'active' }).then(r => setUsers(r.data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await badgesAPI.create({ userId, expiresAt: expiresAt || undefined });
      toast.success('Badge créé');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">Créer un badge</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Utilisateur *</label>
            <select className="select" value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">Sélectionner un utilisateur...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date d'expiration (optionnel - défaut: 1 an)</label>
            <input type="date" className="input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Création...' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BadgesPage() {
  const { t } = useI18n();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await badgesAPI.getAll({ status: statusFilter });
      setBadges(res.data.data.badges);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleAction = async (type, badge) => {
    setConfirmLoading(true);
    try {
      if (type === 'block') await badgesAPI.block(badge._id);
      else if (type === 'unblock') await badgesAPI.unblock(badge._id);
      else if (type === 'renew') await badgesAPI.renew(badge._id);
      toast.success('Badge mis à jour');
      setConfirm(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setConfirmLoading(false); }
  };

  const expiresAlert = (expiresAt) => {
    const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-xs text-red-400">Expiré</span>;
    if (days <= 30) return <span className="text-xs text-amber-400">Expire dans {days}j</span>;
    return <span className="text-xs text-slate-500">{new Date(expiresAt).toLocaleDateString('fr-FR')}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{t('modules.badges')}</h1>
          <p className="page-subtitle">{t('modules.badgesSubtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Créer un badge</button>
      </div>

      <div className="card mb-4">
        <select className="select w-full sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="blocked">Bloqué</option>
          <option value="expired">Expiré</option>
        </select>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Badge ID</th><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Émis le</th><th>Expiration</th><th>Actions</th></tr></thead>
              <tbody>
                {badges.length === 0 && <tr><td colSpan={7}><EmptyState icon={CreditCard} title="Aucun badge trouvé" /></td></tr>}
                {badges.map(b => (
                  <tr key={b._id}>
                    <td><code className="text-xs bg-slate-800 px-2 py-0.5 rounded">{b.badgeId}</code></td>
                    <td className="font-medium text-slate-200">{b.userId?.fullName}</td>
                    <td><StatusBadge value={b.userId?.role} type="role" /></td>
                    <td><StatusBadge value={b.status} type="badgeStatus" /></td>
                    <td className="text-xs text-slate-500">{new Date(b.issuedAt).toLocaleDateString('fr-FR')}</td>
                    <td>{expiresAlert(b.expiresAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {b.status === 'active' && <button className="btn-ghost p-1.5 text-orange-400" title="Bloquer" onClick={() => setConfirm({ type:'block', badge: b })}><Lock size={14} /></button>}
                        {b.status === 'blocked' && <button className="btn-ghost p-1.5 text-emerald-400" title="Débloquer" onClick={() => setConfirm({ type:'unblock', badge: b })}><Unlock size={14} /></button>}
                        <button className="btn-ghost p-1.5 text-blue-400" title="Renouveler" onClick={() => setConfirm({ type:'renew', badge: b })}><RefreshCw size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateBadgeModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetch(); }} />}
      <ConfirmModal
        isOpen={!!confirm}
        danger={confirm?.type === 'block'}
        title={confirm?.type === 'block' ? 'Bloquer le badge' : confirm?.type === 'unblock' ? 'Débloquer le badge' : 'Renouveler le badge'}
        message={`Confirmer cette action pour le badge ${confirm?.badge?.badgeId} ?`}
        onConfirm={() => handleAction(confirm.type, confirm.badge)}
        onCancel={() => setConfirm(null)}
        loading={confirmLoading}
      />
    </div>
  );
}

export default BadgesPage;
