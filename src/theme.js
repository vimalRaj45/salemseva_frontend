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

// Display type is Plus Jakarta Sans: a tighter, more confident voice than the body face,
// which keeps headings from reading as bold body copy. Inter carries everything you read.
const displayFont = '"Plus Jakarta Sans", "Inter", "Noto Sans Tamil", sans-serif';
const bodyFont = '"Inter", "Noto Sans Tamil", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const typographyConfig = {
  fontFamily: bodyFont,
  h1: {
    fontFamily: displayFont,
    fontWeight: 800,
    fontSize: 'clamp(2rem, 1.45rem + 2.4vw, 3.25rem)',
    letterSpacing: '-0.035em',
    lineHeight: 1.06
  },
  h2: {
    fontFamily: displayFont,
    fontWeight: 800,
    fontSize: 'clamp(1.6rem, 1.25rem + 1.5vw, 2.25rem)',
    letterSpacing: '-0.03em',
    lineHeight: 1.12
  },
  h3: {
    fontFamily: displayFont,
    fontWeight: 800,
    fontSize: 'clamp(1.3rem, 1.1rem + 0.85vw, 1.7rem)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  h4: {
    fontFamily: displayFont,
    fontWeight: 700,
    fontSize: 'clamp(1.1rem, 1rem + 0.45vw, 1.3rem)',
    letterSpacing: '-0.015em',
    lineHeight: 1.3
  },
  h5: {
    fontWeight: 700,
    fontSize: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
    letterSpacing: '-0.01em',
    lineHeight: 1.4
  },
  h6: {
    fontWeight: 700,
    fontSize: '0.9375rem',
    letterSpacing: '-0.005em',
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
    fontSize: '1rem',
    lineHeight: 1.6
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.55
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.45,
    letterSpacing: '0.01em'
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
          borderRadius: 10,
          padding: '10px 20px',
          fontWeight: 700,
          fontSize: '0.875rem',
          minHeight: '42px',
          letterSpacing: '-0.005em',
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
          borderRadius: 18,
          border: `1px solid ${cardBorder}`,
          backgroundColor: surfaceBg,
          boxShadow: isDark
            ? '0 1px 3px rgba(0, 0, 0, 0.4)'
            : '0 1px 2px rgba(11, 18, 32, 0.04), 0 1px 3px rgba(11, 18, 32, 0.05)',
          transition: 'border-color 180ms ease, box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none'
        },
        elevation0: {
          border: `1px solid ${surfaceBorder}`
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: isDark ? '#F8FAFC' : brandColors.slate[900],
          '&.Mui-disabled': {
            color: isDark ? '#64748B' : brandColors.slate[400]
          }
        },
        input: {
          color: isDark ? '#F8FAFC' : brandColors.slate[900],
          '&::placeholder': {
            color: isDark ? '#94A3B8' : brandColors.slate[400],
            opacity: 1
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
          minHeight: '46px',
          color: isDark ? '#F8FAFC' : brandColors.slate[900],
          backgroundColor: isDark ? '#111D3B' : '#FFFFFF',
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
          padding: '10px 14px',
          color: isDark ? '#F8FAFC' : brandColors.slate[900],
          '&::placeholder': {
            color: isDark ? '#94A3B8' : brandColors.slate[400],
            opacity: 1
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: isDark ? '#F8FAFC' : brandColors.slate[900],
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          '& span': {
            color: isDark ? '#F8FAFC' : brandColors.slate[900]
          },
          '& *': {
            color: isDark ? '#F8FAFC' : brandColors.slate[900]
          }
        },
        icon: {
          color: isDark ? '#94A3B8' : brandColors.slate[500]
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: isDark ? '#F8FAFC' : brandColors.slate[900],
          fontSize: '0.875rem',
          padding: '8px 14px',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : brandColors.slate[100]
          },
          '&.Mui-selected': {
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(10, 92, 196, 0.08)',
            color: isDark ? '#38BDF8' : brandColors.primary.main,
            fontWeight: 700
          }
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
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        paper: {
          borderRadius: 18,
          padding: '8px',
          border: `1px solid ${surfaceBorder}`,
          backgroundColor: surfaceBg,
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.5)'
            : '0 24px 48px -24px rgba(11, 18, 32, 0.28)',
          maxWidth: 'calc(100vw - 16px)',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '8px',
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: isDark ? '#FFFFFF' : brandColors.slate[900],
          boxSizing: 'border-box'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '8px',
          gap: '8px',
          boxSizing: 'border-box'
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          padding: '8px',
          borderRadius: 8,
          border: `1px solid ${surfaceBorder}`,
          backgroundColor: surfaceBg,
          boxShadow: isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.4)'
            : '0 4px 16px rgba(15, 23, 42, 0.08)',
          boxSizing: 'border-box'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
          fontSize: '0.75rem',
          height: 26,
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? '#334155' : '#0B1220',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: 8,
          padding: '6px 10px'
        },
        arrow: {
          color: isDark ? '#334155' : '#0B1220'
        }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? '#1E293B' : '#E9EEF5'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: surfaceBg,
          borderRight: `1px solid ${surfaceBorder}`,
          boxSizing: 'border-box',
          '&.MuiDrawer-paperAnchorBottom': {
            padding: '8px',
            borderTop: `1px solid ${surfaceBorder}`,
            borderRadius: '8px 8px 0 0',
            maxWidth: '100vw',
            overflowX: 'hidden'
          }
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
    borderRadius: 12
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
    borderRadius: 12
  },
  spacing: 8,
  components: getComponentOverrides(true)
});

// Default alias to preserve all existing theme imports
export const theme = lightTheme;

export function getAppTheme(mode = 'light') {
  return mode === 'dark' ? darkTheme : lightTheme;
}
