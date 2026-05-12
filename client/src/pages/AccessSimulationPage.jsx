import { useEffect, useMemo, useState } from 'react';
import { accessAPI, badgesAPI, buildingsAPI, doorsAPI } from '../api/services';
import toast from 'react-hot-toast';
import { Activity, CheckCircle2, XCircle, AlertTriangle, Zap } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useI18n } from '../i18n/I18nProvider';

const getBuildingId = (door) => door?.buildingId?._id || door?.buildingId || '';

function AccessSimulationPage() {
  const [badges, setBadges] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [doors, setDoors] = useState([]);

  const [badgeId, setBadgeId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [doorId, setDoorId] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { t, language } = useI18n();

  useEffect(() => {
    Promise.all([badgesAPI.getAll(), buildingsAPI.getAll(), doorsAPI.getAll()])
      .then(([br, blr, dr]) => {
        setBadges(br.data.data.badges);
        setBuildings(blr.data.data.buildings);
        setDoors(dr.data.data.doors);
      })
      .catch(() => toast.error(t('common.loadError')))
      .finally(() => setLoadingData(false));
  }, [t]);

  const filteredDoors = useMemo(() => {
    if (!buildingId) return doors;
    return doors.filter(door => getBuildingId(door) === buildingId);
  }, [buildingId, doors]);

  const selectedBadge = useMemo(
    () => badges.find(badge => badge.badgeId === badgeId),
    [badges, badgeId]
  );

  const handleBuildingChange = (nextBuildingId) => {
    setBuildingId(nextBuildingId);
    const selectedDoor = doors.find(door => door._id === doorId);
    if (selectedDoor && getBuildingId(selectedDoor) !== nextBuildingId) {
      setDoorId('');
    }
  };

  const handleDoorChange = (nextDoorId) => {
    setDoorId(nextDoorId);
    const selectedDoor = doors.find(door => door._id === nextDoorId);
    const nextBuildingId = getBuildingId(selectedDoor);
    if (nextBuildingId) setBuildingId(nextBuildingId);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!badgeId || !doorId) {
      toast.error(t('simulation.selectBadgeDoor'));
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await accessAPI.simulate({ badgeId, doorId });
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || t('simulation.error'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setBadgeId('');
    setBuildingId('');
    setDoorId('');
  };

  if (loadingData) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">{t('simulation.title')}</h1>
        <p className="page-subtitle">{t('simulation.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" /> {t('simulation.params')}
          </h2>
          <form onSubmit={handleSimulate} className="space-y-5">
            <div>
              <label className="label">{t('simulation.virtualBadge')}</label>
              <select className="select" value={badgeId} onChange={e => setBadgeId(e.target.value)} required>
                <option value="">{t('simulation.selectBadge')}</option>
                {badges.map(b => (
                  <option key={b._id} value={b.badgeId}>
                    {b.badgeId} - {b.userId?.fullName} [{b.status}]
                  </option>
                ))}
              </select>
            </div>

            {selectedBadge && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400">
                {(() => {
                  const exp = new Date(selectedBadge.expiresAt);
                  const expired = exp < new Date();
                  return (
                    <div className="space-y-1">
                      <p>{t('simulation.holder')}: <span className="text-slate-200">{selectedBadge.userId?.fullName}</span></p>
                      <p>{t('common.role')}: <span className="text-slate-200">{t(`roles.${selectedBadge.userId?.role}`)}</span></p>
                      <p>{t('simulation.badgeStatus')}: <StatusBadge value={selectedBadge.status} type="badgeStatus" /></p>
                      <p>{t('simulation.expires')}: <span className={expired ? 'text-red-400' : 'text-slate-200'}>{exp.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <label className="label">{t('simulation.building')}</label>
              <select className="select" value={buildingId} onChange={e => handleBuildingChange(e.target.value)}>
                <option value="">{t('simulation.allBuildings')}</option>
                {buildings.map(b => <option key={b._id} value={b._id}>{b.name} [{b.status}]</option>)}
              </select>
            </div>

            <div>
              <label className="label">{t('simulation.door')}</label>
              <select className="select" value={doorId} onChange={e => handleDoorChange(e.target.value)} required>
                <option value="">{t('simulation.selectDoor')}</option>
                {filteredDoors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} - {d.buildingId?.name} [{d.securityLevel}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {t('simulation.running')}
                  </span>
                ) : <><Zap size={16} /> {t('simulation.submit')}</>}
              </button>
              {result && <button type="button" onClick={reset} className="btn-secondary">{t('common.reset')}</button>}
            </div>
          </form>
        </div>

        <div className="card flex flex-col">
          <h2 className="font-semibold text-slate-200 mb-5">{t('simulation.result')}</h2>
          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <Activity size={28} className="text-slate-600" />
              </div>
              <p className="text-slate-500">{t('simulation.empty')}</p>
            </div>
          )}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">{t('simulation.checking')}</p>
            </div>
          )}
          {result && (
            <div className={`flex-1 flex flex-col rounded-xl border-2 p-6 transition-all ${
              result.result === 'granted'
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-red-500/40 bg-red-500/5'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                {result.result === 'granted'
                  ? <CheckCircle2 size={40} className="text-emerald-400" />
                  : <XCircle size={40} className="text-red-400" />
                }
                <div>
                  <p className={`text-2xl font-bold ${result.result === 'granted' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.result === 'granted' ? t('simulation.granted') : t('simulation.denied')}
                  </p>
                  <p className="text-sm text-slate-400">{result.reason}</p>
                </div>
              </div>

              {result.suspicious && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm font-medium">{t('simulation.suspicious')}</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                {result.badge && (
                  <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">{t('simulation.badge')}</p>
                    <p className="text-slate-300">ID: <code className="bg-slate-700 px-1 rounded">{result.badge.badgeId}</code></p>
                    <p className="text-slate-300">{t('common.status')}: <StatusBadge value={result.badge.status} type="badgeStatus" /></p>
                  </div>
                )}
                {result.user && (
                  <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">{t('simulation.user')}</p>
                    <p className="text-slate-300">{result.user.fullName}</p>
                    <p className="text-slate-400">{t('common.role')}: {t(`roles.${result.user.role}`)} · {t('common.status')}: {t(`statuses.${result.user.status}`)}</p>
                  </div>
                )}
                {result.door && (
                  <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">{t('simulation.requestedAccess')}</p>
                    <p className="text-slate-300">{result.building?.name} - {result.door?.name}</p>
                    <p className="text-slate-400">{t('simulation.securityLevel')}: <StatusBadge value={result.door.securityLevel} type="securityLevel" /></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccessSimulationPage;
