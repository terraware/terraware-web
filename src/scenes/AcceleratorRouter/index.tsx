import React, { useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Slide, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation from 'src/utils/useStateLocation';

import Cohorts from './Cohorts';
import Deliverables from './Deliverables';
import DocumentsRouter from './Documents';
import ModuleContent from './Modules';
import NavBar from './NavBar';
import Overview from './Overview';
import ParticipantProjects from './ParticipantProjects';
import Participants from './Participants';
import People from './People';

interface AcceleratorRouterProps {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px',
    },
  },
  contentWithNavBar: {
    '& > div, & > main': {
      paddingLeft: '220px',
    },
  },
  navBarOpened: {
    backdropFilter: 'blur(8px)',
    background: getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.8),
    height: '100%',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 1300,
    inset: '0px',
  },
}));

const AcceleratorRouter = ({ showNavBar, setShowNavBar }: AcceleratorRouterProps) => {
  const { type } = useDeviceInfo();
  const classes = useStyles();
  const location = useStateLocation();
  const documentProducerEnabled = isEnabled('Document Producer');

  const viewHasBackgroundImage = useCallback((): boolean => {
    return location.pathname.startsWith(APP_PATHS.ACCELERATOR_OVERVIEW);
  }, [location]);

  return (
    <>
      {type !== 'desktop' ? (
        <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
          <div className={classes.navBarOpened}>
            <NavBar setShowNavBar={setShowNavBar} />
          </div>
        </Slide>
      ) : (
        <NavBar setShowNavBar={setShowNavBar} backgroundTransparent={viewHasBackgroundImage()} />
      )}
      <div
        className={`${type === 'desktop' && showNavBar ? classes.contentWithNavBar : ''} ${
          classes.content
        } scrollable-content`}
      >
        <ErrorBoundary setShowNavBar={setShowNavBar}>
          <Routes>
            <Route path={APP_PATHS.ACCELERATOR_OVERVIEW} element={<Overview />} />

            <Route path={`${APP_PATHS.ACCELERATOR_COHORTS}/*`} element={<Cohorts />} />
            <Route path={`${APP_PATHS.ACCELERATOR_DELIVERABLES}/*`} element={<Deliverables />} />
            <Route path={APP_PATHS.ACCELERATOR_MODULE_CONTENT} element={<ModuleContent />} />
            <Route path={`${APP_PATHS.ACCELERATOR_PEOPLE}/*`} element={<People />} />
            <Route path={`${APP_PATHS.ACCELERATOR_PARTICIPANTS}/*`} element={<Participants />} />
            <Route path={`${APP_PATHS.ACCELERATOR_PROJECT_VIEW}/*`} element={<ParticipantProjects />} />

            {documentProducerEnabled && (
              <Route path={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS} element={<DocumentsRouter />} />
            )}
            <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_OVERVIEW} />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default AcceleratorRouter;
