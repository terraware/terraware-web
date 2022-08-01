import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    neutral: Palette['grey'];
    state: {
      5: React.CSSProperties['color'];
    };
    accent: {
      1: React.CSSProperties['color'];
      2: React.CSSProperties['color'];
      3: React.CSSProperties['color'];
      4: React.CSSProperties['color'];
    };
    blue: {
      600: React.CSSProperties['color'];
    };
    red: {
      50: React.CSSProperties['color'];
      600: React.CSSProperties['color'];
    };
    green: {
      50: React.CSSProperties['color'];
      600: React.CSSProperties['color'];
    };
    gray: {
      200: React.CSSProperties['color'];
      800: React.CSSProperties['color'];
    };
  }
  interface PaletteOptions {
    neutral: PaletteOptions['grey'];
    state: {
      5: React.CSSProperties['color'];
    };
    accent: {
      1: React.CSSProperties['color'];
      2: React.CSSProperties['color'];
      3: React.CSSProperties['color'];
      4: React.CSSProperties['color'];
    };
    blue: {
      600: React.CSSProperties['color'];
    };
    red: {
      50: React.CSSProperties['color'];
      600: React.CSSProperties['color'];
    };
    green: {
      50: React.CSSProperties['color'];
      600: React.CSSProperties['color'];
    };
    gray: {
      200: React.CSSProperties['color'];
      800: React.CSSProperties['color'];
    };
  }
}

export default createTheme({
  typography: {
    fontFamily: 'Inter',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*::-webkit-scrollbar': {
          WebkitAppearance: 'none',
          width: '7px',
          height: '7px',
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: '4px',
          backgroundColor: '#6C757D',
        },
        body: {
          color: '#3a4445',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#0067C8',
    },
    secondary: {
      main: '#D40002',
    },
    state: {
      5: '#CD5B38',
    },
    accent: {
      1: '#315CAF',
      2: '#EF9644',
      3: '#CD5B38',
      4: '#3F96E6',
    },
    neutral: {
      50: '#F8F9FA',
      100: '#F3F4F6',
      200: '#E9ECEF',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
    },
    blue: {
      600: '#0067C8',
    },
    red: {
      50: '#FFF1F1',
      600: '#D40002',
    },
    green: {
      50: '#D6FDE5',
      600: '#27764E',
    },
    gray: {
      200: '#CAD2D3',
      800: '#3A4445',
    },
  },
});
