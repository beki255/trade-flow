import { storage } from '../utils/storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  accent: string;
  danger: string;
  success: string;
  inputBg: string;
}

export const lightColors: ThemeColors = {
  background: '#F4F9FD',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0284C7',
  accent: '#38BDF8',
  danger: '#EF4444',
  success: '#10B981',
  inputBg: '#F8FAFC',
};

export const darkColors: ThemeColors = {
  background: '#090E17',
  card: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#1E293B',
  primary: '#0284C7',
  accent: '#38BDF8',
  danger: '#F87171',
  success: '#34D399',
  inputBg: '#1E293B',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('tradeflow_mobile_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('tradeflow_mobile_theme', t);
      } catch (e) {
        // ignore
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        colors,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
