import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import am from '../locales/am.json';
import om from '../locales/om.json';

export type Language = 'EN' | 'AM' | 'OM';

const dictionaries: Record<Language, any> = {
  EN: en,
  AM: am,
  OM: om,
};

// Helper to look up key by dot notation or search
function resolveKey(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // Direct dot notation lookup
  const parts = path.split('.');
  let current = obj;
  let found = true;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      found = false;
      break;
    }
  }
  if (found && typeof current === 'string') {
    return current;
  }

  // Fallback: check flat key
  if (typeof obj[path] === 'string') {
    return obj[path];
  }

  return undefined;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('tradeflow_lang');
        if (saved === 'AM' || saved === 'OM' || saved === 'EN') return saved;
      }
    } catch {
      // ignore
    }
    return 'EN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('tradeflow_lang', lang);
      }
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    if (language === 'EN') setLanguage('AM');
    else if (language === 'AM') setLanguage('OM');
    else setLanguage('EN');
  };

  const t = (key: string): string => {
    const val = resolveKey(dictionaries[language], key);
    if (val !== undefined) return val;

    const fallback = resolveKey(dictionaries.EN, key);
    if (fallback !== undefined) return fallback;

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
