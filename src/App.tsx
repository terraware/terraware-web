import React, { useEffect, useMemo, useState } from 'react';
import { MixpanelProvider } from 'react-mixpanel-browser';
import { useMixpanel } from 'react-mixpanel-browser';
import { Provider } from 'react-redux';

import { Box, CssBaseline, StyledEngineProvider, useTheme } from '@mui/material';

import AppBootstrap from 'src/AppBootstrap';
import CookieConsentBanner from 'src/components/CookieConsentBanner';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import BlockingSpinner from 'src/components/common/BlockingSpinner';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useAppVersion } from 'src/hooks/useAppVersion';
import { useLocalization, useUser } from 'src/providers';
import { store } from 'src/redux/store';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import useApplicationPortal from './hooks/useApplicationPortal';
import ApplicationPortalRouter from './scenes/ApplicationRouter/portal';

const AcceleratorRouter = React.lazy(() => import('src/scenes/AcceleratorRouter'));
const TerrawareRouter = React.lazy(() => import('src/scenes/TerrawareRouter'));

// Mixpanel setup
const MIXPANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN;
const MIXPANEL_CONFIG = {
  opt_out_persistence_by_default: true,
  opt_out_tracking_by_default: true,
  track_pageview: 'url-with-path',
};

function AppContent() {
  // manager hooks
  useAppVersion();
  const { isDesktop, type } = useDeviceInfo();
  const { user, isAllowed } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isApplicationPortal } = useApplicationPortal();
  const theme = useTheme();
  const mixpanel = useMixpanel();

  const [showNavBar, setShowNavBar] = useState(true);

  useEffect(() => {
    if (user && mixpanel) {
      if (user.cookiesConsented === true) {
        mixpanel.opt_in_tracking();
        mixpanel.identify(user.id);
        mixpanel.people.set({
          $email: user.email,
          $locale: user.locale,
          $emailNotifsEnabled: user.emailNotificationsEnabled,
          $countryCode: user.countryCode,
        });
      } else {
        mixpanel.opt_out_tracking();
      }
    }
  }, [user, mixpanel]);

  useEffect(() => {
    if (type === 'mobile' || type === 'tablet') {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [type]);

  // Localized strings are stored outside of React's state, but there's a state change when they're
  // updated. Declare the dependency here so the app rerenders when the locale changes.
  useLocalization();

  const mainBoxStyles = useMemo(() => {
    return {
      backgroundColor: theme.palette.TwClrBaseGray025,
      backgroundImage:
        'linear-gradient(180deg,' +
        `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
        `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`,
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      '& .navbar': {
        backgroundColor: isDesktop ? theme.palette.TwClrBaseGray025 : theme.palette.TwClrBaseWhite,
        backgroundImage: isDesktop
          ? 'linear-gradient(180deg,' +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`
          : null,
        backgroundAttachment: 'fixed',
        paddingRight: isDesktop ? '8px' : undefined,
        marginTop: isDesktop ? '96px' : '0px',
        paddingTop: isDesktop ? '0px' : '24px',
        overflowY: 'auto',
        width: isDesktop ? '210px' : '300px',
        zIndex: 1000,
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.TwClrBgGhostActive,
        },
        '& .nav-footer': {
          marginBottom: isDesktop ? '128px' : '32px',
        },
      },
    };
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <ToastSnackbar />
      <CookieConsentBanner />
      <TopBar>
        <TopBarContent setShowNavBar={setShowNavBar} />
      </TopBar>

      <Box sx={mainBoxStyles}>
        <React.Suspense fallback={<BlockingSpinner />}>
          {/* TODO: Add application console router for applciations/{id} case */}
          {isAcceleratorRoute && isAllowed('VIEW_CONSOLE') ? (
            <AcceleratorRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
          ) : isApplicationPortal ? (
            <ApplicationPortalRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
          ) : (
            <TerrawareRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
          )}
        </React.Suspense>
      </Box>
    </StyledEngineProvider>
  );
}

export default function App(): JSX.Element {
  return (
    <MixpanelProvider config={MIXPANEL_CONFIG} token={MIXPANEL_TOKEN}>
      <Provider store={store}>
        <AppBootstrap>
          <AppContent />
        </AppBootstrap>
      </Provider>
    </MixpanelProvider>
  );
}
