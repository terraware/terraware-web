import { createTheme } from '@mui/material';
import type { GridProps } from '@mui/material/Grid';
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
    // Preserve GridLegacy's full-width container behavior.
    MuiGrid: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: ({ ownerState }: { ownerState: Partial<GridProps> }) =>
                ownerState.container && Object.keys((ownerState.size ?? {}) as object).length === 0,
              style: { width: '100%' },
            },
          ],
        },
      },
    },
  },
});

export default theme;
