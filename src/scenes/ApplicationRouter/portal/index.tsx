import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Box, Slide, useTheme } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ApplicationProvider from '../provider';
import NavBar from './NavBar';
import Overview from './Overview';

interface ApplicationPortalRouterProp {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const ApplicationPortalRouter = ({ showNavBar, setShowNavBar }: ApplicationPortalRouterProp) => {
  const { type } = useDeviceInfo();
  const theme = useTheme();

  const applicationEnabled = isEnabled('Accelerator Application');
  const { goToHome } = useNavigateTo();

  useEffect(() => {
    if (!applicationEnabled) {
      goToHome();
    }
  }, [applicationEnabled, goToHome]);

  const navBarOpened = {
    backdropFilter: 'blur(8px)',
    background: getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.8),
    height: '100%',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 1300,
    inset: '0px',
  };

  const contentStyles = {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px !important',
    },
  };

  const contentWithNavBar = {
    '& > div, & > main': {
      paddingTop: '96px !important',
      paddingLeft: '220px !important',
    },
  };

  return (
    <>
      <ApplicationProvider>
        {type !== 'desktop' ? (
          <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
            <Box sx={navBarOpened}>
              <NavBar setShowNavBar={setShowNavBar} />
            </Box>
          </Slide>
        ) : (
          <NavBar setShowNavBar={setShowNavBar} />
        )}
        <Box
          sx={type === 'desktop' && showNavBar ? { ...contentStyles, ...contentWithNavBar } : contentStyles}
          className='scrollable-content'
        >
          <ErrorBoundary setShowNavBar={setShowNavBar}>
            <Routes>
              <Route path={'/applications/:applicationId'} element={<Overview />} />
            </Routes>
          </ErrorBoundary>
        </Box>
      </ApplicationProvider>
    </>
  );
};

export default ApplicationPortalRouter;
