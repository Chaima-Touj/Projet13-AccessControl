import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supportedLanguages, translations } from './translations';

const I18nContext = createContext(null);

const interpolate = (value, params = {}) => {
  if (typeof value !== 'string') return value;
  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{{${key}}}`, replacement ?? ''),
    value
  );
};

const readKey = (dict, key) => key.split('.').reduce((acc, part) => acc?.[part], dict);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('language');
    return supportedLanguages.includes(saved) ? saved : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const setLanguage = (nextLanguage) => {
      if (supportedLanguages.includes(nextLanguage)) setLanguageState(nextLanguage);
    };

    const t = (key, params) => {
      const translated = readKey(translations[language], key) ?? readKey(translations.fr, key);
      return interpolate(translated ?? key, params);
    };

    return { language, setLanguage, t };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};
