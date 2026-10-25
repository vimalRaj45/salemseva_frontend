import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '../theme';

const ColorModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
  setColorMode: () => {}
});

export const useColorMode = () => useContext(ColorModeContext);

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('shazuone_color_mode');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (_) {}
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('shazuone_color_mode', mode);
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.body.style.backgroundColor = '#0B132B';
        document.body.style.color = '#F8FAFC';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#F8FAFC';
        document.body.style.color = '#0F172A';
      }
    } catch (_) {}
  }, [mode]);

  const colorModeActions = useMemo(() => ({
    mode,
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    setColorMode: (newMode) => setMode(newMode === 'dark' ? 'dark' : 'light')
  }), [mode]);

  const activeTheme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorModeActions}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default ColorModeContext;
