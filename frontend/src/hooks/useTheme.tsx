import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'theme-dark-mode';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, String(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  const setDarkMode = (value: boolean | ((prev: boolean) => boolean)) => {
    setDarkModeState(value);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme needs ThemeProvider');
  }
  return ctx;
};
