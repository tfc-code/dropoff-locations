import React, { FC } from 'react';
import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#307EE7',
    },
    secondary: {
      main: '#334781',
    },
    text: {
      secondary: '#6B6C72',
    },
  },
  typography: {
    fontFamily: "'Lato', sans-serif;",
    h1: {
      fontSize: '34px',
      fontWeight: 'bold',
      marginBottom: '12px',
    },
    h2: {
      fontSize: '1.5rem',
    },
  },
  overrides: {
    MuiBackdrop: {
      root: {
        zIndex: 2,
      },
    },
    MuiCardHeader: {
      title: {
        fontWeight: 'bold',
        fontSize: '18px',
      },
      root: {
        paddingBottom: 0,
      },
    },
    MuiCardActions: {
      root: {
        borderTop: '2px solid rgba(0, 0, 0, .12)',
      },
    },
    MuiCircularProgress: {
      colorPrimary: {
        color: 'white',
      },
    },
    MuiCssBaseline: {
      '@global': {
        '.bold': {
          fontWeight: 'bold',
        },
        '.full-width': {
          width: '100%',
        },
      },
    },
  },
});

theme.overrides = {
  ...theme.overrides,
  MuiTypography: {
    ...theme.overrides.MuiTypography,
    caption: {
      color: theme.palette.text.secondary,
    },
  },
  MuiSvgIcon: {
    ...theme.overrides.MuiTypography,
    root: {
      color: theme.palette.text.secondary,
    },
  },
};

export const Theme: FC = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
