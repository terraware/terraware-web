import { createTheme } from '@mui/material';
import { theme as baseTheme } from '@terraware/web-components';
// This import is needed to get the types for customized Palette, unfortunately this is the easiest fix for now.
import '@terraware/web-components/style-dictionary-dist/TerrawareTheme';
/* eslint-disable @typescript-eslint/no-unused-vars */
import TerrawareThemeOptions from '@terraware/web-components/style-dictionary-dist/TerrawareTheme';

const theme = createTheme(baseTheme, {
  components: {
    MuiTableCell: {
      styleOverrides: {
        body: {
          fontSize: '16px',
        },
      },
    },
  },
});

export default theme;
