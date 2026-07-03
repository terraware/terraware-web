import React, { type JSX, useEffect, useState } from 'react';

import { CssBaseline, GlobalStyles, StyledEngineProvider, Theme } from '@mui/material';

import BlockingSpinner from 'src/components/common/BlockingSpinner';
import strings from 'src/strings';
import { findLocaleDetails, supportedLocales } from 'src/strings/locales';

import LearnMoreView from './LearnMoreView';

// The public Learn More page renders outside of `AppContent`, so it does not inherit the app-wide MUI
// styling scaffolding. Reproduce the purely presentational pieces of `AppContent` here — the emotion
// injection order (`injectFirst`, so `@terraware/web-components` SCSS resolves correctly against MUI's
// styles), the CSS baseline, and the page background. The auth-only providers, top bar, and routers
// that `AppContent` also sets up are intentionally left out: they require a logged-in user and would
// redirect a public visitor to the login flow.
const globalStyles = (theme: Theme) => ({
  html: { backgroundColor: theme.palette.TwClrBaseWhite },
  body: { backgroundColor: theme.palette.TwClrBaseWhite },
});

const LearnMore = (): JSX.Element => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadStrings = async () => {
      const publicLocales = supportedLocales.filter((locale) => !locale.inDevelopment);
      const localeDetails = findLocaleDetails(publicLocales, navigator.language || 'en');
      strings.setContent({ [localeDetails.id]: (await localeDetails.loadModule()).strings });
      strings.setLanguage(localeDetails.id);
      setReady(true);
    };

    void loadStrings();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      {ready ? <LearnMoreView /> : <BlockingSpinner />}
    </StyledEngineProvider>
  );
};

export default LearnMore;
