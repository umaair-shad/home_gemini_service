import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '../types';
import { translations } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: typeof translations['en'];
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('shm_locale');
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem('shm_locale', loc);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ur' ? 'rtl' : 'ltr';
    if (locale === 'ur') {
      document.body.classList.add('font-urdu');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.add('font-sans');
      document.body.classList.remove('font-urdu');
    }
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t: translations[locale],
    isRtl: locale === 'ur',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
