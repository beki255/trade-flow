import React, { createContext, useContext, useState, ReactNode } from 'react';
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

  // Fallback: check in common sections (nav, hero, features, pricing, contact, footer)
  const sections = ['nav', 'hero', 'features', 'pricing', 'contact', 'footer'];
  for (const sec of sections) {
    if (obj[sec] && typeof obj[sec] === 'object') {
      if (typeof obj[sec][path] === 'string') {
        return obj[sec][path];
      }
    }
  }

  return undefined;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tradeflow_lang');
      if (saved === 'AM' || saved === 'OM' || saved === 'EN') return saved;
    } catch {
      // ignore
    }
    return 'EN';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('tradeflow_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    // 1. Try selected language
    const val = resolveKey(dictionaries[language], key);
    if (val !== undefined) return val;

    // 2. Fallback to English
    const fallback = resolveKey(dictionaries.EN, key);
    if (fallback !== undefined) return fallback;

    // 3. Return key as last resort
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
