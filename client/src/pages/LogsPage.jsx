import { useEffect, useState } from 'react';
import { logsAPI, buildingsAPI, doorsAPI } from '../api/services';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { FileText, Download, Search, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useI18n } from '../i18n/I18nProvider';

function LogsPage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'security';

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const [doors, setDoors] = useState([]);

  const [filters, setFilters] = useState({
    result: '', buildingId: '', doorId: '', startDate: '', endDate: '', page: 1, limit: 30
  });

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  useEffect(() => {
    if (isAdmin) {
      Promise.all([buildingsAPI.getAll(), doorsAPI.getAll()])
        .then(([br, dr]) => { setBuildings(br.data.data.buildings); setDoors(dr.data.data.doors); });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    const fn = isAdmin ? logsAPI.getAll(cleanFilters) : logsAPI.getMyLogs(cleanFilters);
    fn.then(r => {
      setLogs(r.data.data);
      setPagination(r.data.pagination || {});
    }).catch(() => toast.error(t('common.loadError')))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleExport = async () => {
    try {
      const res = await logsAPI.export({ result: filters.result, startDate: filters.startDate, endDate: filters.endDate });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `access-logs-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    } catch { toast.error(t('common.error')); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{isAdmin ? t('modules.accessLogs') : t('modules.myLogs')}</h1>
          <p className="page-subtitle">{t('modules.logsSubtitle')}</p>
        </div>
        {isAdmin && (
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} /> Exporter CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <select className="select w-full sm:w-36" value={filters.result} onChange={e => setFilter('result', e.target.value)}>
            <option value="">{t('common.all')}</option>
            <option value="granted">Autorisé</option>
            <option value="denied">Refusé</option>
          </select>
          {isAdmin && (
            <>
              <select className="select w-full sm:w-44" value={filters.buildingId} onChange={e => setFilter('buildingId', e.target.value)}>
                <option value="">Tous les bâtiments</option>
                {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <select className="select w-full sm:w-44" value={filters.doorId} onChange={e => setFilter('doorId', e.target.value)}>
                <option value="">Toutes les portes</option>
                {doors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </>
          )}
          <input type="date" className="input w-full sm:w-40" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} />
          <input type="date" className="input w-full sm:w-40" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} />
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {isAdmin && <th>Utilisateur</th>}
                    <th>Badge ID</th>
                    <th>Bâtiment</th>
                    <th>Porte</th>
                    <th>Résultat</th>
                    <th>Raison</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 && <tr><td colSpan={7}><EmptyState icon={FileText} title="Aucun log trouvé" /></td></tr>}
                  {logs.map(log => (
                    <tr key={log._id}>
                      {isAdmin && <td className="font-medium text-slate-200">{log.userId?.fullName || 'N/A'}</td>}
                      <td><code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">{log.badgeId}</code></td>
                      <td>{log.buildingId?.name || '—'}</td>
                      <td>{log.doorId?.name || '—'}</td>
                      <td><StatusBadge value={log.result} type="access" /></td>
                      <td className="text-xs text-slate-400">{log.reason || '—'}</td>
                      <td className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                <p className="text-xs text-slate-500">Page {pagination.page} / {pagination.pages} — {pagination.total} entrées</p>
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs px-3 py-1.5" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Précédent</button>
                  <button className="btn-secondary text-xs px-3 py-1.5" disabled={pagination.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Suivant</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LogsPage;
