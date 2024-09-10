import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Box, Slide, useTheme } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import ApplicationProvider from 'src/providers/Application';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import SectionDeliverable from './Deliverable';
import SectionDeliverableEditView from './DeliverableEdit';
import MapView from './Map';
import MapUpdateView from './MapUpdate';
import NavBar from './NavBar';
import Overview from './Overview';
import PrescreenView from './Prescreen';
import PrescreenResultView from './PrescreenResult';
import ReviewView from './Review';
import SectionView from './Sections';

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
            <Route path={`${APP_PATHS.APPLICATION_MAP}`} element={<MapView />} />
            <Route path={`${APP_PATHS.APPLICATION_MAP_UPDATE}`} element={<MapUpdateView />} />
            <Route path={`${APP_PATHS.APPLICATION_OVERVIEW}`} element={<Overview />} />
            <Route path={`${APP_PATHS.APPLICATION_PRESCREEN}`} element={<PrescreenView />} />
            <Route path={`${APP_PATHS.APPLICATION_PRESCREEN_RESULT}`} element={<PrescreenResultView />} />
            <Route path={`${APP_PATHS.APPLICATION_REVIEW}`} element={<ReviewView />} />
            <Route path={`${APP_PATHS.APPLICATION_SECTION}`} element={<SectionView />} />
            <Route path={`${APP_PATHS.APPLICATION_SECTION_DELIVERABLE}`} element={<SectionDeliverable />} />
            <Route
              path={`${APP_PATHS.APPLICATION_SECTION_DELIVERABLE_EDIT}`}
              element={<SectionDeliverableEditView />}
            />
            <Route path={'*'} element={<Navigate to={APP_PATHS.APPLICATIONS} />} />
          </Routes>
        </ErrorBoundary>
      </Box>
    </ApplicationProvider>
  );
};

export default ApplicationPortalRouter;
