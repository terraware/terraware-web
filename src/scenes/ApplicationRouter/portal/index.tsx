import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Box, Slide, useTheme } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import NavBar from './NavBar';
import Overview from './Overview';

interface ApplicationPortalRouterProp {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const ApplicationPortalRouter = ({ showNavBar, setShowNavBar }: ApplicationPortalRouterProp) => {
  const { type } = useDeviceInfo();
  const theme = useTheme();

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
            <Route path={'*'} element={<Overview />} />
          </Routes>
        </ErrorBoundary>
      </Box>
    </>
  );
};

export default ApplicationPortalRouter;
