import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB', // Professional Salem Blue
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0D9488', // Teal accent
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#16A34A',
      light: '#22C55E',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.025em', color: '#0F172A' },
    h2: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#0F172A' },
    h3: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.015em', color: '#0F172A' },
    h4: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em', color: '#0F172A' },
    h5: { fontWeight: 600, fontSize: '1rem', color: '#0F172A' },
    h6: { fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', color: '#0F172A' },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', color: '#334155' },
    body1: { fontSize: '0.875rem', lineHeight: 1.5, color: '#334155' },
    body2: { fontSize: '0.8125rem', lineHeight: 1.45, color: '#64748B' },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#64748B' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#2563EB',
          '&:hover': {
            backgroundColor: '#1D4ED8',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation0: {
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 24,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2563EB',
          },
        },
        input: {
          fontSize: '0.875rem',
        },
      },
    },
  },
});
