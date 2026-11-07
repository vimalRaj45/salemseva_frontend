import { createTheme } from '@mui/material/styles';

/**
 * Shazu Ops Design System - Single Source of Truth MUI Theme
 * Pure Material UI (v5/v6) tokens - No hard-coded random hex
 */
export const slate = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  main: '#475569',
  light: '#94A3B8',
  dark: '#1E293B',
  contrastText: '#FFFFFF'
};

export const palette = {
  mode: 'light',
  primary: {
    main: '#1D6FE5',
    light: '#4B8DF8',
    dark: '#1254B7',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#0284C7',
    light: '#38BDF8',
    dark: '#0369A1',
    contrastText: '#FFFFFF'
  },
  success: {
    main: '#16A34A',
    light: '#DCFCE7',
    dark: '#15803D',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#D97706',
    light: '#FEF3C7',
    dark: '#B45309',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#DC2626',
    light: '#FEE2E2',
    dark: '#991B1B',
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#0284C7',
    light: '#E0F2FE',
    dark: '#0369A1',
    contrastText: '#FFFFFF'
  },
  background: {
    default: slate[50],
    paper: '#FFFFFF'
  },
  text: {
    primary: slate[900],
    secondary: slate[600],
    disabled: slate[400]
  },
  divider: slate[200],
  slate
};

export const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
    color: slate[900]
  },
  h2: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
    color: slate[900]
  },
  h3: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    color: slate[900]
  },
  h4: {
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.4,
    color: slate[900]
  },
  h5: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.45,
    color: slate[900]
  },
  h6: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.45,
    color: slate[900]
  },
  subtitle1: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.5,
    color: slate[800]
  },
  subtitle2: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.5,
    color: slate[700]
  },
  body1: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    color: slate[800]
  },
  body2: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
    color: slate[600]
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.4,
    color: slate[500]
  },
  overline: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    lineHeight: 1.4,
    color: slate[500]
  },
  button: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.01em'
  }
};

export const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: slate[50],
        color: slate[900],
        fontFamily: '"Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      },
      '*::-webkit-scrollbar': {
        width: '6px',
        height: '6px'
      },
      '*::-webkit-scrollbar-track': {
        background: slate[100]
      },
      '*::-webkit-scrollbar-thumb': {
        background: slate[300],
        borderRadius: '3px'
      },
      '*::-webkit-scrollbar-thumb:hover': {
        background: slate[400]
      }
    }
  },
  MuiCard: {
    defaultProps: {
      elevation: 0
    },
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        border: `1px solid ${slate[200]}`,
        borderRadius: '12px',
        boxShadow: 'none',
        backgroundImage: 'none'
      }
    }
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0
    },
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        border: `1px solid ${slate[200]}`,
        boxShadow: 'none',
        backgroundImage: 'none'
      },
      rounded: {
        borderRadius: '12px'
      }
    }
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true
    },
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: '8px',
        lineHeight: 1.4,
        padding: '8px 16px',
        '&.MuiButton-sizeSmall': {
          height: '36px',
          padding: '6px 12px',
          fontSize: '12px'
        },
        '&.MuiButton-sizeMedium': {
          height: '40px',
          padding: '8px 16px',
          fontSize: '13px'
        },
        '&.MuiButton-sizeLarge': {
          height: '44px',
          padding: '10px 20px',
          fontSize: '14px'
        }
      },
      containedPrimary: {
        backgroundColor: '#1D6FE5',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#1254B7'
        }
      },
      outlined: {
        borderColor: slate[300],
        color: slate[700],
        '&:hover': {
          borderColor: slate[400],
          backgroundColor: slate[50]
        }
      }
    }
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        color: slate[600],
        padding: '6px',
        '&:hover': {
          backgroundColor: slate[100],
          color: slate[900]
        }
      },
      sizeSmall: {
        width: '32px',
        height: '32px'
      }
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        height: '44px',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        fontSize: '14px',
        color: slate[900],
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: slate[300],
          transition: 'border-color 0.15s ease-in-out'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: slate[400]
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1D6FE5',
          borderWidth: '1.5px'
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: '#DC2626'
        },
        '&.Mui-disabled': {
          backgroundColor: slate[50],
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: slate[200]
          }
        }
      },
      input: {
        padding: '10px 14px',
        '&[type=number]': {
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right'
        }
      }
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: slate[50],
        '& .MuiTableCell-head': {
          color: slate[600],
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: `1px solid ${slate[200]}`,
          padding: '12px 16px',
          height: '44px',
          backgroundColor: slate[50]
        }
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${slate[200]}`,
        padding: '14px 16px',
        fontSize: '13px',
        color: slate[800]
      }
    }
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: slate[50]
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '12px',
        height: '24px'
      },
      sizeSmall: {
        height: '20px',
        fontSize: '11px'
      }
    }
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 38,
        height: 22,
        padding: 0,
        display: 'flex',
        '& .MuiSwitch-switchBase': {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#FFFFFF',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: '#1D6FE5'
            }
          }
        },
        '& .MuiSwitch-thumb': {
          width: 18,
          height: 18,
          borderRadius: 9,
          boxShadow: 'none'
        },
        '& .MuiSwitch-track': {
          borderRadius: 11,
          opacity: 1,
          backgroundColor: slate[300]
        }
      }
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: '44px',
        borderBottom: `1px solid ${slate[200]}`
      },
      indicator: {
        height: '3px',
        backgroundColor: '#1D6FE5',
        borderRadius: '3px 3px 0 0'
      }
    }
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: '44px',
        padding: '10px 16px',
        textTransform: 'none',
        fontSize: '13px',
        fontWeight: 600,
        color: slate[600],
        '&.Mui-selected': {
          color: '#1D6FE5',
          fontWeight: 700
        }
      }
    }
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: slate[900],
        color: '#FFFFFF',
        fontSize: '11px',
        fontWeight: 500,
        borderRadius: '6px',
        padding: '6px 10px'
      },
      arrow: {
        color: slate[900]
      }
    }
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',
        border: `1px solid ${slate[200]}`,
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)'
      }
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${slate[200]}`,
        boxShadow: 'none'
      }
    }
  }
};

export const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  components
});

export default theme;
