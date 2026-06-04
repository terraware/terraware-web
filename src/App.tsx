import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { MixpanelProvider, useMixpanel } from 'react-mixpanel-browser';
import { Provider } from 'react-redux';

import { Box, CssBaseline, GlobalStyles, StyledEngineProvider, useTheme } from '@mui/material';

import AppBootstrap from 'src/AppBootstrap';
import CookieConsentBanner from 'src/components/CookieConsentBanner';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import BlockingSpinner from 'src/components/common/BlockingSpinner';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useAppVersion } from 'src/hooks/useAppVersion';
import { MixpanelUserProfile } from 'src/mixpanelEvents';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { store } from 'src/redux/store';
import AcceleratorRouter from 'src/scenes/AcceleratorRouter';
import FunderRouter from 'src/scenes/FunderRouter';
import TerrawareRouter from 'src/scenes/TerrawareRouter';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import DisclaimerContainer from './components/Disclaimer/DisclaimerContainer';
import useApplicationPortal from './hooks/useApplicationPortal';
import useFunderPortal from './hooks/useFunderPortal';
import ApplicationPortalRouter from './scenes/ApplicationRouter/portal';

// Mixpanel setup
// The SDK initializes opted-out (no cookies, no localStorage, no network) until
// the consent effect below flips it on. The track_pageview config auto-tracks
// SPA route changes; the first pageview after consent is captured by an explicit
// track_pageview() call once we opt in (the auto-pageview that fired during
// init itself was dropped because we were still opted out at the time).
const MIXPANEL_TOKEN = import.meta.env.PUBLIC_MIXPANEL_TOKEN;
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
  const { selectedOrganization } = useOrganization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isApplicationPortal } = useApplicationPortal();
  const { isFunderRoute } = useFunderPortal();
  const theme = useTheme();
  const mixpanel = useMixpanel();

  const [showNavBar, setShowNavBar] = useState(true);

  useEffect(() => {
    if (user && mixpanel) {
      if (user.cookiesConsented === true) {
        const profile: MixpanelUserProfile = {
          $email: user.email,
          $first_name: user.firstName,
          $last_name: user.lastName,
          $country_code: user.countryCode,
          $timezone: user.timeZone,
          locale: user.locale,
          email_notifs_enabled: user.emailNotificationsEnabled,
          user_type: user.userType,
          global_roles: user.globalRoles,
          is_internal_user: user.globalRoles.length > 0,
        };
        mixpanel.opt_in_tracking();
        mixpanel.identify(user.id);
        mixpanel.people.set(profile);
        // Capture the current page: the auto-pageview from SDK init was dropped
        // because we were opted out at the time. Subsequent SPA route changes
        // are picked up by the track_pageview config now that we're opted in.
        mixpanel.track_pageview();
      } else {
        mixpanel.opt_out_tracking();
        mixpanel.reset();
      }
    }
  }, [user, mixpanel]);

  // Keep org context registered as super properties whenever the active
  // organization changes. Re-registering with new values overwrites the old
  // ones so every subsequent event (including auto-pageviews, which
  // `useTrackEvent` can't reach) carries the current org.
  useEffect(() => {
    if (user && mixpanel && user.cookiesConsented === true) {
      mixpanel.register({
        organization_id: selectedOrganization?.id,
        organization_role: selectedOrganization?.role,
        user_type: user.userType,
        is_internal_user: user.globalRoles.length > 0,
      });
    }
  }, [user, mixpanel, selectedOrganization]);

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

  const appBackgroundImage = useMemo(
    () =>
      'linear-gradient(180deg,' +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`,
    [theme]
  );

  const documentBackgroundStyles = useMemo(
    () => ({
      html: {
        backgroundColor: theme.palette.TwClrBaseGray025,
      },
      body: {
        backgroundAttachment: 'fixed',
        backgroundColor: theme.palette.TwClrBaseGray025,
        backgroundImage: appBackgroundImage,
      },
    }),
    [appBackgroundImage, theme]
  );

  const mainBoxStyles = useMemo(() => {
    return {
      backgroundColor: theme.palette.TwClrBaseGray025,
      backgroundImage: appBackgroundImage,
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      '& .navbar': {
        backgroundColor: isDesktop ? theme.palette.TwClrBaseGray025 : theme.palette.TwClrBaseWhite,
        backgroundImage: isDesktop ? appBackgroundImage : null,
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
  }, [appBackgroundImage, isDesktop, theme]);

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <GlobalStyles styles={documentBackgroundStyles} />
      <ToastSnackbar />
      <CookieConsentBanner />
      <TopBar>
        <TopBarContent setShowNavBar={setShowNavBar} />
      </TopBar>

      <Box sx={mainBoxStyles}>
        <DisclaimerContainer>
          <React.Suspense fallback={<BlockingSpinner />}>
            {/* TODO: Add application console router for applciations/{id} case */}
            {isAcceleratorRoute && isAllowed('VIEW_CONSOLE') ? (
              <AcceleratorRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
            ) : isApplicationPortal ? (
              <ApplicationPortalRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
            ) : isFunderRoute ? (
              <FunderRouter />
            ) : (
              <TerrawareRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
            )}
          </React.Suspense>
        </DisclaimerContainer>
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
