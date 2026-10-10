import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066CC', // Official Salem Brand Blue
      light: '#3385D6',
      dark: '#0052CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6600', // Official SalemSeva Vibrant Orange
      light: '#FF8533',
      dark: '#E65C00',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#16A34A', // Salem Eco Green (Plumbing tile)
      light: '#22C55E',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FF6600', // Salem Orange (Electrical tile)
      light: '#F59E0B',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0D9488', // Salem Clean Teal (Cleaning tile)
      light: '#14B8A6',
      dark: '#0F766E',
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
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em', color: '#0F172A' },
    h2: { fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.015em', color: '#0F172A' },
    h3: { fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#0F172A' },
    h4: { fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#0F172A' },
    h5: { fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' },
    h6: { fontWeight: 600, fontSize: '0.8125rem', color: '#0F172A' },
    subtitle1: { fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem', color: '#334155' },
    body1: { fontSize: '0.8rem', lineHeight: 1.45, color: '#334155' },
    body2: { fontSize: '0.75rem', lineHeight: 1.4, color: '#64748B' },
    caption: { fontSize: '0.6875rem', lineHeight: 1.35, color: '#64748B' },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 14px',
          fontWeight: 700,
          fontSize: '0.78rem',
          minHeight: '34px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#0066CC',
          '&:hover': {
            backgroundColor: '#0052CC',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
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
          fontWeight: 700,
          fontSize: '0.6875rem',
          height: 22,
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
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxSizing: 'content-box',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '4px 0',
          minWidth: 'auto',
          '&.Mui-selected': {
            color: '#0066CC',
          },
        },
        label: {
          fontSize: '0.65rem !important',
          fontWeight: 600,
          '&.Mui-selected': {
            fontSize: '0.68rem !important',
            fontWeight: 800,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.8rem',
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0066CC',
          },
        },
        input: {
          fontSize: '0.8rem',
          padding: '8px 12px',
        },
      },
    },
  },
});
