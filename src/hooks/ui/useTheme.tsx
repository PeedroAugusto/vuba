import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

const themes: Record<Theme, ThemeColors> = {
  light: {
    primary: '#1a73e8',
    secondary: '#5f6368',
    background: '#ffffff',
    text: '#202124',
    border: '#dadce0',
  },
  dark: {
    primary: '#8ab4f8',
    secondary: '#9aa0a6',
    background: '#202124',
    text: '#e8eaed',
    border: '#3c4043',
  },
};

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const setSystemTheme = useCallback(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, [setTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = themes[theme];

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    colors: themes[theme],
    toggleTheme,
    setTheme,
    setSystemTheme,
  };
}; 