'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeCtx {
  darkMode: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ darkMode: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextDarkMode = saved ? saved === 'dark' : prefersDark;

    const timeoutId = window.setTimeout(() => {
      setDarkMode(nextDarkMode);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  function toggleDark() {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
