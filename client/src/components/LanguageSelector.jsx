import { Languages } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className="inline-flex items-center gap-2 text-xs text-slate-400">
      <Languages size={15} className="text-slate-500" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        className="select py-1.5 pl-2 pr-8 text-xs min-h-0 w-auto"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t('common.language')}
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}

export default LanguageSelector;
