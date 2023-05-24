import type { Preview } from '@storybook/react';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;

import theme from '../src/theme';
import { useState } from 'react';
import { LocalizationProvider } from '../src/providers';

export const decorators = [
  (Story) => {
    const [selectedLocale, setSelectedLocale] = useState('en');
    const [activeLocale, setActiveLocale] = useState<string | null>(null);

    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider
          selectedLocale={selectedLocale}
          setSelectedLocale={setSelectedLocale}
          activeLocale={activeLocale}
          setActiveLocale={setActiveLocale}
        >
          <StyledEngineProvider injectFirst>
            <Story />
          </StyledEngineProvider>
        </LocalizationProvider>
      </ThemeProvider>
    );
  },
];
