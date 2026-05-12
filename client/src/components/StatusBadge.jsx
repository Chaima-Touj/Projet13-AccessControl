import { useI18n } from '../i18n/I18nProvider';

function StatusBadge({ value, type }) {
  const { t } = useI18n();

  const maps = {
    access: { granted: 'badge-green', denied: 'badge-red' },
    userStatus: { active: 'badge-green', suspended: 'badge-red' },
    badgeStatus: { active: 'badge-green', blocked: 'badge-red', expired: 'badge-yellow' },
    buildingStatus: { active: 'badge-green', inactive: 'badge-slate' },
    doorStatus: { active: 'badge-green', inactive: 'badge-slate' },
    severity: { low: 'badge-blue', medium: 'badge-yellow', high: 'badge-orange', critical: 'badge-red' },
    incidentStatus: { open: 'badge-red', investigating: 'badge-yellow', resolved: 'badge-green' },
    role: { admin: 'badge-purple', security: 'badge-blue', teacher: 'badge-yellow', student: 'badge-green' },
    securityLevel: { low: 'badge-green', medium: 'badge-yellow', high: 'badge-red' },
    permissionStatus: { active: 'badge-green', inactive: 'badge-slate' },
  };

  const cls = maps[type]?.[value] || 'badge-slate';
  const label = t(`statuses.${value}`);

  return <span className={cls}>{label === `statuses.${value}` ? value : label}</span>;
}

export default StatusBadge;
