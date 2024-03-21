import React, { useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

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
import ModuleContent from './Modules';
import NavBar from './NavBar';
import Overview from './Overview';
import ParticipantProjects from './ParticipantProjects';
import Participants from './Participants';
import People from './People';
import Scoring from './Scoring';
import Voting from './Voting';

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
  const consoleEnabled = isEnabled('Console');

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
          <Switch>
            <Route path={APP_PATHS.ACCELERATOR_OVERVIEW}>
              <Overview />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_COHORTS}>
              <Cohorts />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_DELIVERABLES}>
              <Deliverables />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_MODULE_CONTENT}>
              <ModuleContent />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_PEOPLE}>
              <People />
            </Route>
            {consoleEnabled && (
              <Route path={APP_PATHS.ACCELERATOR_SCORING}>
                <Scoring />
              </Route>
            )}
            {consoleEnabled && (
              <Route path={APP_PATHS.ACCELERATOR_VOTING}>
                <Voting />
              </Route>
            )}
            {consoleEnabled && (
              <Route path={APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW}>
                <Participants />
              </Route>
            )}
            {consoleEnabled && (
              <Route path={APP_PATHS.ACCELERATOR_PROJECT_VIEW}>
                <ParticipantProjects />
              </Route>
            )}
            <Route path={'*'}>
              <Redirect to={APP_PATHS.ACCELERATOR_OVERVIEW} />
            </Route>
          </Switch>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default AcceleratorRouter;
