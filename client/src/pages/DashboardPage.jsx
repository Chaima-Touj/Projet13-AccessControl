import { useEffect, useState } from 'react';
import { dashboardAPI } from '../api/services';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, CreditCard, Building2, DoorOpen, CheckCircle2, XCircle,
  AlertTriangle, TrendingUp, Clock, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../i18n/I18nProvider';

function StatCard({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value ?? '—'}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    dashboardAPI.admin().then(r => setData(r.data.data)).catch(() => toast.error('Dashboard error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSpinner />;
  if (!data) return null;
  const { stats, charts, topDenied, recentLogs, recentIncidents } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('dashboard.users')} value={stats.totalUsers} iconClass="bg-blue-500/15 text-blue-400" />
        <StatCard icon={CreditCard} label={t('dashboard.activeBadges')} value={stats.activeBadges} iconClass="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={Building2} label="Bâtiments" value={stats.totalBuildings} iconClass="bg-purple-500/15 text-purple-400" />
        <StatCard icon={DoorOpen} label={t('dashboard.doors')} value={stats.totalDoors} iconClass="bg-amber-500/15 text-amber-400" />
        <StatCard icon={CheckCircle2} label="Autorisés aujourd'hui" value={stats.grantedToday} iconClass="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={XCircle} label="Refusés aujourd'hui" value={stats.deniedToday} iconClass="bg-red-500/15 text-red-400" />
        <StatCard icon={CreditCard} label="Badges bloqués" value={stats.blockedBadges} iconClass="bg-orange-500/15 text-orange-400" />
        <StatCard icon={AlertTriangle} label={t('dashboard.openIncidents')} value={stats.openIncidents} iconClass="bg-red-500/15 text-red-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><TrendingUp size={17} /> 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="granted" name="Autorisés" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="denied" name="Refusés" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><XCircle size={17} className="text-red-400" /> Portes refusées</h3>
          <div className="space-y-3">
            {topDenied.length === 0 && <p className="text-slate-500 text-sm">Aucune donnée</p>}
            {topDenied.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center text-xs font-bold text-slate-400">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{d.name}</p>
                  <div className="h-1.5 bg-slate-800 rounded-full mt-1">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (d.count / (topDenied[0]?.count || 1)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-red-400">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Clock size={17} /> Derniers accès</h3>
          <div className="space-y-2">
            {recentLogs.slice(0,6).map(log => (
              <div key={log._id} className="flex items-center gap-3 py-2 border-t border-slate-800 first:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.result === 'granted' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{log.userId?.fullName}</p>
                  <p className="text-xs text-slate-500">{log.doorId?.name} · {new Date(log.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <StatusBadge value={log.result} type="access" />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><AlertTriangle size={17} className="text-amber-400" /> Incidents récents</h3>
          <div className="space-y-2">
            {recentIncidents.length === 0 && <p className="text-slate-500 text-sm">Aucun incident</p>}
            {recentIncidents.map(inc => (
              <div key={inc._id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{inc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{inc.createdBy?.fullName} · {new Date(inc.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <StatusBadge value={inc.severity} type="severity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityDashboard() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = () => dashboardAPI.security().then(r => setData(r.data.data)).catch(() => {});
    load();
    setLoading(false);
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);
  if (loading) return <LoadingSpinner />;
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={AlertTriangle} label={t('dashboard.openIncidents')} value={data.stats.openIncidents} iconClass="bg-red-500/15 text-red-400" />
        <StatCard icon={XCircle} label={t('dashboard.deniedToday')} value={data.stats.totalDeniedToday} iconClass="bg-orange-500/15 text-orange-400" />
        <StatCard icon={Shield} label="Activités suspectes" value={data.stats.suspiciousCount} iconClass="bg-purple-500/15 text-purple-400" />
      </div>
      {data.suspicious.length > 0 && (
        <div className="card border-red-500/30 bg-red-500/5">
          <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={17} /> Activités suspectes</h3>
          {data.suspicious.map((s, i) => (
            <p key={i} className="text-sm text-red-300">🚨 Badge <code className="bg-slate-800 px-1 rounded">{s._id}</code> utilisé {s.count}× en 10 min (badge bloqué)</p>
          ))}
        </div>
      )}
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <XCircle size={17} className="text-red-400" /> Derniers refus
          <span className="ml-auto text-xs text-slate-500">Auto-refresh 30s</span>
        </h3>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Utilisateur</th><th>Porte</th><th>Raison</th><th>Date</th></tr></thead>
            <tbody>
              {data.recentDenied.map(log => (
                <tr key={log._id}>
                  <td>{log.userId?.fullName || 'N/A'}</td>
                  <td>{log.doorId?.name || 'N/A'}</td>
                  <td><span className="badge-red">{log.reason}</span></td>
                  <td className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserDashboard() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    dashboardAPI.user().then(r => setData(r.data.data)).catch(() => toast.error('Dashboard error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSpinner />;
  if (!data) return null;
  const { badge, stats, recentLogs } = data;
  return (
    <div className="space-y-6">
      <div className="card border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-slate-900">
        {badge ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-48 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-blue-900/50">
              <CreditCard size={28} className="text-white/80 mb-1" />
              <p className="text-white font-mono text-xs font-bold">{badge.badgeId}</p>
              <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{badge.status.toUpperCase()}</div>
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p>ID: <code className="text-slate-300 bg-slate-800 px-1 rounded">{badge.badgeId}</code></p>
              <p>Statut: <StatusBadge value={badge.status} type="badgeStatus" /></p>
              <p>Expire: {new Date(badge.expiresAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        ) : <p className="text-slate-400 text-sm">Aucun badge associé.</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CreditCard} label="Total accès" value={stats.totalAccess} iconClass="bg-blue-500/15 text-blue-400" />
        <StatCard icon={CheckCircle2} label="Autorisés" value={stats.totalGranted} iconClass="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={XCircle} label="Refusés" value={stats.totalDenied} iconClass="bg-red-500/15 text-red-400" />
      </div>
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-4">Mes derniers accès</h3>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Porte</th><th>Bâtiment</th><th>Résultat</th><th>Date</th></tr></thead>
            <tbody>
              {recentLogs.length === 0 && <tr><td colSpan={4} className="text-center text-slate-500 py-6">Aucun accès enregistré</td></tr>}
              {recentLogs.map(log => (
                <tr key={log._id}>
                  <td>{log.doorId?.name || 'N/A'}</td>
                  <td>{log.buildingId?.name || 'N/A'}</td>
                  <td><StatusBadge value={log.result} type="access" /></td>
                  <td className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const titles = {
    admin: t('dashboard.titleAdmin'),
    security: t('dashboard.titleSecurity'),
    teacher: t('dashboard.titleUser'),
    student: t('dashboard.titleUser')
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">{titles[user?.role]}</h1>
        <p className="page-subtitle">{t('dashboard.welcome', { name: user?.fullName })}</p>
      </div>
      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'security' && <SecurityDashboard />}
      {(user?.role === 'student' || user?.role === 'teacher') && <UserDashboard />}
    </div>
  );
}

export default DashboardPage;
