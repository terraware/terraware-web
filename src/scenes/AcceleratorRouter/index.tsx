import React, { useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Box, Slide, useTheme } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import ApplicationProvider from 'src/providers/Application';
import SpeciesProvider from 'src/providers/Species/SpeciesProvider';
import PlantingSiteProvider from 'src/providers/Tracking/PlantingSiteProvider';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation from 'src/utils/useStateLocation';

import ActivityLogRouter from '../ActivityLogRouter';
import Applications from './Applications';
import Cohorts from './Cohorts';
import Deliverables from './Deliverables';
import DocumentsRouter from './Documents';
import FundingEntities from './FundingEntities';
import MatrixView from './MatrixView';
import ModuleContent from './Modules';
import EventEdit from './Modules/EventEdit';
import ModuleView from './Modules/ModuleView';
import NavBar from './NavBar';
import ParticipantProjects from './ParticipantProjects';
import People from './People';

interface AcceleratorRouterProps {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const AcceleratorRouter = ({ showNavBar, setShowNavBar }: AcceleratorRouterProps) => {
  const { type } = useDeviceInfo();
  const location = useStateLocation();
  const theme = useTheme();

  const viewHasBackgroundImage = useCallback((): boolean => {
    return location.pathname.startsWith(APP_PATHS.ACCELERATOR_PROJECTS);
  }, [location]);

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
      <PlantingSiteProvider>
        <SpeciesProvider>
          {type !== 'desktop' ? (
            <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
              <Box sx={navBarOpened}>
                <NavBar setShowNavBar={setShowNavBar} />
              </Box>
            </Slide>
          ) : (
            <NavBar setShowNavBar={setShowNavBar} backgroundTransparent={viewHasBackgroundImage()} />
          )}
          <Box
            sx={type === 'desktop' || showNavBar ? { ...contentStyles, ...contentWithNavBar } : contentStyles}
            className='scrollable-content'
          >
            <ErrorBoundary setShowNavBar={setShowNavBar}>
              <Routes>
                <Route path={`${APP_PATHS.ACCELERATOR_PROJECTS}/*`} element={<MatrixView />} />
                <Route path={`${APP_PATHS.ACCELERATOR_ACTIVITY_LOG}/*`} element={<ActivityLogRouter />} />
                <Route path={`${APP_PATHS.ACCELERATOR_APPLICATIONS}/*`} element={<Applications />} />
                <Route path={`${APP_PATHS.ACCELERATOR_COHORTS}/*`} element={<Cohorts />} />
                <Route path={`${APP_PATHS.ACCELERATOR_DELIVERABLES}/*`} element={<Deliverables />} />
                <Route path={`${APP_PATHS.ACCELERATOR_MODULES}/*`} element={<ModuleContent />} />
                <Route path={`${APP_PATHS.ACCELERATOR_MODULE_CONTENT}/*`} element={<ModuleView />} />
                <Route path={`${APP_PATHS.ACCELERATOR_MODULE_EVENTS_EDIT}/*`} element={<EventEdit />} />
                <Route path={`${APP_PATHS.ACCELERATOR_PEOPLE}/*`} element={<People />} />
                <Route path={`${APP_PATHS.ACCELERATOR_PROJECT_VIEW}/*`} element={<ParticipantProjects />} />
                <Route path={`${APP_PATHS.ACCELERATOR_FUNDING_ENTITIES}/*`} element={<FundingEntities />} />
                <Route path={`${APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS}/*`} element={<DocumentsRouter />} />
                <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECTS} />} />
              </Routes>
            </ErrorBoundary>
          </Box>
        </SpeciesProvider>
      </PlantingSiteProvider>
    </ApplicationProvider>
  );
};

export default AcceleratorRouter;
