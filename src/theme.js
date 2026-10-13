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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #0066CC',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 700,
          fontSize: '0.8125rem',
          minHeight: '40px',
          boxShadow: 'none',
          transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: '2px solid #0066CC',
            outlineOffset: '2px',
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        },
        containedPrimary: {
          backgroundColor: '#0066CC',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0052CC',
          },
          '&:active': {
            backgroundColor: '#003D99',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#0F172A',
          '&:hover': {
            borderColor: '#CBD5E1',
            backgroundColor: '#F8FAFC',
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
          backgroundColor: '#FFFFFF',
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
          height: 24,
          '&:focus-visible': {
            outline: '2px solid #0066CC',
            outlineOffset: '1px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxSizing: 'content-box',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '6px 0',
          minWidth: 'auto',
          minHeight: '44px',
          '&.Mui-selected': {
            color: '#0066CC',
          },
          '&:focus-visible': {
            outline: '2px solid #0066CC',
            outlineOffset: '-2px',
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
          fontSize: '0.8125rem',
          minHeight: '40px',
          '& fieldset': {
            borderColor: '#E2E8F0',
            transition: 'border-color 140ms ease',
          },
          '&:hover fieldset': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0066CC',
            borderWidth: '2px',
          },
          '&.Mui-error fieldset': {
            borderColor: '#DC2626',
          },
        },
        input: {
          fontSize: '0.8125rem',
          padding: '9px 12px',
        },
      },
    },
  },
});
