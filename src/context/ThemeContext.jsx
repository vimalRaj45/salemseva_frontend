import React, { createContext, useContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from '../theme';

const ColorModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
  setColorMode: () => {}
});

export const useColorMode = () => useContext(ColorModeContext);

export function AppThemeProvider({ children }) {
  useEffect(() => {
    try {
      localStorage.setItem('shazuone_color_mode', 'light');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
      document.body.style.color = '#0F172A';
    } catch (_) {}
  }, []);

  const colorModeActions = {
    mode: 'light',
    toggleColorMode: () => {},
    setColorMode: () => {}
  };

  return (
    <ColorModeContext.Provider value={colorModeActions}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default ColorModeContext;
