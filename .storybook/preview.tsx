import { useState } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react';

import { LocalizationProvider } from '../src/providers';
import { store } from '../src/redux/store';
import theme from '../src/theme';

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
            <MemoryRouter initialEntries={['/']}>
              <Provider store={store}>
                <Story />
              </Provider>
            </MemoryRouter>
          </StyledEngineProvider>
        </LocalizationProvider>
      </ThemeProvider>
    );
  },
];
