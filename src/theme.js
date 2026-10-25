import { createTheme } from '@mui/material/styles';

// Brand Tokens extracted from official logo.svg
export const brandColors = {
  // Primary Logo Body Gradient & Wordmark
  primary: {
    main: '#0A5CC4', // Logo middle royal blue
    light: '#0A86EC', // Logo sky blue gradient start
    dark: '#022F6E', // Logo deep navy wordmark
    contrastText: '#FFFFFF'
  },
  // Secondary Logo Wordmark & Leaf Swoosh
  secondary: {
    main: '#2B9236', // Logo "One" green
    light: '#7DC93F', // Logo leaf swoosh end
    dark: '#1B6E24', // Deep accessible green
    contrastText: '#FFFFFF'
  },
  // Logo Swoosh Accents
  accent: {
    cyan: '#08B8DC', // Logo swoosh cyan
    teal: '#17A898', // Logo swoosh middle teal
    navy: '#02307F' // Logo body gradient deep end
  },
  // Neutral Slate Palette
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  },
  // Semantic Harmonized Colors (WCAG AA Compliant)
  semantic: {
    success: {
      main: '#2B9236',
      light: '#ECFDF5',
      dark: '#14532D',
      contrastText: '#FFFFFF'
    },
    warning: {
      main: '#D97706',
      light: '#FFFBEB',
      dark: '#92400E',
      contrastText: '#FFFFFF'
    },
    error: {
      main: '#DC2626',
      light: '#FEF2F2',
      dark: '#991B1B',
      contrastText: '#FFFFFF'
    },
    info: {
      main: '#0A5CC4',
      light: '#EFF6FF',
      dark: '#1E3A8A',
      contrastText: '#FFFFFF'
    }
  }
};

const typographyConfig = {
  fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: {
    fontWeight: 800,
    fontSize: 'clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)',
    letterSpacing: '-0.025em',
    lineHeight: 1.2
  },
  h2: {
    fontWeight: 800,
    fontSize: 'clamp(1.4rem, 1.15rem + 1.1vw, 2rem)',
    letterSpacing: '-0.02em',
    lineHeight: 1.25
  },
  h3: {
    fontWeight: 700,
    fontSize: 'clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem)',
    letterSpacing: '-0.015em',
    lineHeight: 1.3
  },
  h4: {
    fontWeight: 700,
    fontSize: 'clamp(1.05rem, 0.98rem + 0.35vw, 1.25rem)',
    letterSpacing: '-0.01em',
    lineHeight: 1.35
  },
  h5: {
    fontWeight: 600,
    fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.125rem)',
    lineHeight: 1.4
  },
  h6: {
    fontWeight: 600,
    fontSize: 'clamp(0.875rem, 0.85rem + 0.15vw, 1rem)',
    lineHeight: 1.45
  },
  subtitle1: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5
  },
  subtitle2: {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.45
  },
  body1: {
    fontSize: '0.9375rem',
    lineHeight: 1.55
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4
  },
  button: {
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '0.875rem',
    letterSpacing: '0.01em'
  }
};

const getComponentOverrides = (isDark = false) => {
  const primaryMain = isDark ? '#38BDF8' : brandColors.primary.main;
  const primaryLight = isDark ? '#7DD3FC' : brandColors.primary.light;
  const primaryDark = isDark ? '#0284C7' : brandColors.primary.dark;
  const surfaceBorder = isDark ? '#243356' : brandColors.slate[200];
  const surfaceBg = isDark ? '#162244' : '#FFFFFF';
  const cardBorder = isDark ? '#203056' : brandColors.slate[200];
  const hoverRowBg = isDark ? 'rgba(255, 255, 255, 0.04)' : brandColors.slate[50];

  return {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false
      },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${primaryLight}`,
            outlineOffset: '2px'
          }
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 700,
          fontSize: '0.875rem',
          minHeight: '40px',
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus-visible': {
            outline: `2px solid ${primaryLight}`,
            outlineOffset: '2px'
          },
          '&.Mui-disabled': {
            opacity: 0.55
          }
        },
        containedPrimary: {
          backgroundColor: primaryMain,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: primaryDark,
            boxShadow: '0 2px 8px rgba(10, 92, 196, 0.25)'
          },
          '&:active': {
            backgroundColor: isDark ? '#0369A1' : '#022353'
          }
        },
        containedSecondary: {
          backgroundColor: brandColors.secondary.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: brandColors.secondary.dark,
            boxShadow: '0 2px 8px rgba(43, 146, 54, 0.25)'
          }
        },
        outlined: {
          borderColor: surfaceBorder,
          color: isDark ? '#F1F5F9' : brandColors.slate[900],
          '&:hover': {
            borderColor: primaryMain,
            backgroundColor: hoverRowBg
          }
        }
      }
    },
    MuiCard: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${cardBorder}`,
          backgroundColor: surfaceBg,
          boxShadow: isDark
            ? '0 1px 3px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
          transition: 'border-color 150ms ease, box-shadow 150ms ease'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none'
        },
        elevation0: {
          border: `1px solid ${surfaceBorder}`
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          minHeight: '42px',
          backgroundColor: isDark ? '#0F1A34' : '#FFFFFF',
          '& fieldset': {
            borderColor: surfaceBorder,
            transition: 'border-color 140ms ease'
          },
          '&:hover fieldset': {
            borderColor: isDark ? '#475569' : brandColors.slate[400]
          },
          '&.Mui-focused fieldset': {
            borderColor: primaryMain,
            borderWidth: '2px'
          },
          '&.Mui-error fieldset': {
            borderColor: brandColors.semantic.error.main
          }
        },
        input: {
          padding: '10px 14px'
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0'
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? '#111D3B' : brandColors.slate[50],
          '& .MuiTableCell-head': {
            color: isDark ? '#94A3B8' : brandColors.slate[600],
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '12px 16px',
            borderBottom: `1px solid ${surfaceBorder}`
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '0.875rem',
          borderBottom: `1px solid ${surfaceBorder}`
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 120ms ease',
          '&:hover': {
            backgroundColor: hoverRowBg
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${surfaceBorder}`,
          boxShadow: isDark
            ? '0 20px 35px rgba(0, 0, 0, 0.6)'
            : '0 20px 35px -5px rgba(15, 23, 42, 0.12), 0 10px 15px -5px rgba(15, 23, 42, 0.04)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 700,
          fontSize: '0.75rem',
          height: 24,
          '&:focus-visible': {
            outline: `2px solid ${primaryLight}`,
            outlineOffset: '1px'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: primaryMain
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          padding: '8px 16px',
          fontWeight: 700,
          fontSize: '0.875rem',
          textTransform: 'none',
          color: isDark ? '#94A3B8' : brandColors.slate[500],
          '&.Mui-selected': {
            color: primaryMain
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: surfaceBg,
          color: isDark ? '#FFFFFF' : brandColors.slate[900],
          borderBottom: `1px solid ${surfaceBorder}`,
          boxShadow: 'none'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: surfaceBg,
          borderRight: `1px solid ${surfaceBorder}`
        }
      }
    }
  };
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    success: brandColors.semantic.success,
    warning: brandColors.semantic.warning,
    error: brandColors.semantic.error,
    info: brandColors.semantic.info,
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    },
    text: {
      primary: brandColors.slate[900],
      secondary: brandColors.slate[600],
      disabled: brandColors.slate[400]
    },
    divider: brandColors.slate[200]
  },
  typography: typographyConfig,
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: getComponentOverrides(false)
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7',
      contrastText: '#0F172A'
    },
    secondary: {
      main: '#34D399',
      light: '#6EE7B7',
      dark: '#059669',
      contrastText: '#0F172A'
    },
    success: {
      main: '#34D399',
      light: '#064E3B',
      dark: '#059669',
      contrastText: '#0F172A'
    },
    warning: {
      main: '#FBBF24',
      light: '#78350F',
      dark: '#D97706',
      contrastText: '#0F172A'
    },
    error: {
      main: '#F87171',
      light: '#7F1D1D',
      dark: '#DC2626',
      contrastText: '#FFFFFF'
    },
    info: {
      main: '#38BDF8',
      light: '#0C4A6E',
      dark: '#0284C7',
      contrastText: '#0F172A'
    },
    background: {
      default: '#0B132B',
      paper: '#162244'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      disabled: '#64748B'
    },
    divider: '#243356'
  },
  typography: typographyConfig,
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: getComponentOverrides(true)
});

// Default alias to preserve all existing theme imports
export const theme = lightTheme;

export function getAppTheme(mode = 'light') {
  return mode === 'dark' ? darkTheme : lightTheme;
}
