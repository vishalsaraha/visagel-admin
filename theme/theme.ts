'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const getVisagelTheme = (_mode: 'light' | 'dark' = 'light') => {
  let theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#FF6900', // Branzept Orange
        light: '#FF8A33',
        dark: '#E05D00',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#334155',
        light: '#64748B',
        dark: '#1E293B',
        contrastText: '#FFFFFF',
      },
      success: {
        main: '#16A34A',
        light: '#4ADE80',
        dark: '#15803D',
      },
      warning: {
        main: '#D97706',
        light: '#FBBF24',
        dark: '#B45309',
      },
      error: {
        main: '#DC2626',
        light: '#F87171',
        dark: '#B91C1C',
      },
      info: {
        main: '#0284C7',
        light: '#38BDF8',
        dark: '#0369A1',
      },
      background: {
        default: '#F8FAFC',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#0F172A',
        secondary: '#64748B',
      },
      divider: '#E2E8F0',
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em', color: '#0F172A' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em', color: '#0F172A', fontSize: '1.5rem' },
      h5: { fontWeight: 600, color: '#0F172A' },
      h6: { fontWeight: 600, color: '#0F172A' },
      subtitle1: { fontWeight: 500, color: '#334155' },
      subtitle2: { fontWeight: 600, color: '#1E293B' },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '6px 16px',
            boxShadow: 'none',
            fontSize: '0.84rem',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            backgroundColor: '#FF6900',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#E05D00',
            },
          },
          outlined: {
            borderColor: '#CBD5E1',
            color: '#334155',
            '&:hover': {
              borderColor: '#94A3B8',
              backgroundColor: '#F8FAFC',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            backgroundImage: 'none',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: '#E2E8F0',
            padding: '12px 16px',
            fontSize: '0.84rem',
          },
          head: {
            fontWeight: 600,
            backgroundColor: '#F8FAFC',
            color: '#475569',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid #E2E8F0',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 4,
            fontSize: '0.75rem',
            height: 24,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            borderBottom: '1px solid #E2E8F0',
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};

