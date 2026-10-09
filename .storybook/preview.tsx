import { useState } from 'react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { setupWorker } from 'msw/browser';

import { LocalizationProvider } from '../src/providers';
import { store } from '../src/redux/store';
import theme from '../src/theme';
import { mswHandlers } from './mswHandlers';

const preview: Preview = {
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker(...mswHandlers);
      await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
      return worker;
    }),
  ],
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
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider
            selectedLocale={selectedLocale}
            setSelectedLocale={setSelectedLocale}
            activeLocale={activeLocale}
            setActiveLocale={setActiveLocale}
          >
            <StyledEngineProvider injectFirst>
              <MemoryRouter initialEntries={['/']}>
                <Story />
              </MemoryRouter>
            </StyledEngineProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </Provider>
    );
  },
];
