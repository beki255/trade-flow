import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  accent: string;
  danger: string;
  warning: string;
  success: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  headerBg: string;
  modalBg: string;
}

export const lightColors: ThemeColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0284C7',
  accent: '#0369A1',
  danger: '#EF4444',
  warning: '#D97706',
  success: '#10B981',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  headerBg: '#FFFFFF',
  modalBg: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  background: '#090E17',
  card: '#0F172A',
  surface: '#1E293B',
  surfaceHover: '#2A374A',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#1E293B',
  primary: '#0284C7',
  accent: '#38BDF8',
  danger: '#F87171',
  warning: '#F59E0B',
  success: '#34D399',
  inputBg: '#1E293B',
  inputBorder: '#334155',
  tabBarBg: '#090E17',
  tabBarBorder: '#1E293B',
  headerBg: '#0B111E',
  modalBg: '#0F172A',
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
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to modern sleek dark theme

  useEffect(() => {
    storage.getItem('tradeflow_mobile_theme').then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved as Theme);
      }
    });
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    storage.setItem('tradeflow_mobile_theme', t).catch(() => {});
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
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
