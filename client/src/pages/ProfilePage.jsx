import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { badgesAPI } from '../api/services';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, CreditCard, Mail, Building, Shield } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useI18n } from '../i18n/I18nProvider';

const ROLE_LABELS = { admin: 'Administrateur', security: 'Agent de Sécurité', teacher: 'Enseignant', student: 'Étudiant' };

function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    badgesAPI.getMyBadge()
      .then(r => setBadge(r.data.data.badge))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">{t('modules.profileTitle')}</h1>
        <p className="page-subtitle">{t('modules.profileSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg shadow-blue-900/40">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-100">{user?.fullName}</h2>
          <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
          <div className="mt-3">
            <StatusBadge value={user?.role} type="role" />
          </div>
          <div className="mt-3">
            <StatusBadge value={user?.status} type="userStatus" />
          </div>
        </div>

        {/* Info */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-200 mb-4">Informations du compte</h3>
          {[
            { icon: User, label: 'Nom complet', value: user?.fullName },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Shield, label: 'Rôle', value: ROLE_LABELS[user?.role] || user?.role },
            { icon: Building, label: 'Département', value: user?.department || '—' },
            { icon: User, label: 'Statut', value: user?.status === 'active' ? 'Actif' : 'Suspendu' },
            { icon: User, label: 'Membre depuis', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-lg">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-slate-200 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge display */}
      <div className="card mt-6">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <CreditCard size={17} className="text-blue-400" /> Mon Badge Virtuel
        </h3>
        {badge ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-56 h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-blue-900/50 border border-blue-500/30">
              <div className="absolute top-3 left-4 text-white/40 text-xs font-bold tracking-widest">UNIVERSITÉ</div>
              <CreditCard size={24} className="text-white/60 mb-2" />
              <p className="text-white font-mono text-xs font-bold tracking-wider">{badge.badgeId}</p>
              <div className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold ${
                badge.status === 'active' ? 'bg-emerald-500 text-white' :
                badge.status === 'blocked' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'
              }`}>{badge.status.toUpperCase()}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="text-slate-500 w-28">Badge ID</span>
                <code className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-xs">{badge.badgeId}</code>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-500 w-28">Statut</span>
                <StatusBadge value={badge.status} type="badgeStatus" />
              </div>
              <div className="flex gap-3">
                <span className="text-slate-500 w-28">Émis le</span>
                <span className="text-slate-300">{new Date(badge.issuedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-500 w-28">Expire le</span>
                <span className={new Date(badge.expiresAt) < new Date() ? 'text-red-400' : 'text-slate-300'}>
                  {new Date(badge.expiresAt).toLocaleDateString('fr-FR')}
                  {new Date(badge.expiresAt) < new Date() && ' ⚠️ Expiré'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Aucun badge associé à votre compte. Contactez un administrateur.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
