import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Slide, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS } from 'src/constants';
import CohortEditView from 'src/scenes/AcceleratorRouter/CohortEditView';
import CohortListView from 'src/scenes/AcceleratorRouter/CohortListView';
import CohortNewView from 'src/scenes/AcceleratorRouter/CohortNewView';
import CohortView from 'src/scenes/AcceleratorRouter/CohortView';
import DeliverableViewWrapper from 'src/scenes/AcceleratorRouter/DeliverableViewWrapper';
import DeliverablesList from 'src/scenes/AcceleratorRouter/DeliverablesList';
import ModuleContentView from 'src/scenes/AcceleratorRouter/ModuleContentView';
import NavBar from 'src/scenes/AcceleratorRouter/NavBar';
import OverviewView from 'src/scenes/AcceleratorRouter/OverviewView';
import PeopleView from 'src/scenes/AcceleratorRouter/PeopleView';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation from 'src/utils/useStateLocation';

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
              <OverviewView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_COHORTS_EDIT}>
              <CohortEditView />
            </Route>
            <Route exact path={APP_PATHS.ACCELERATOR_COHORTS}>
              <CohortListView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_COHORTS_NEW}>
              <CohortNewView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_COHORTS_VIEW}>
              <CohortView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_DELIVERABLES_VIEW}>
              <DeliverableViewWrapper />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_DELIVERABLES}>
              <DeliverablesList />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_MODULE_CONTENT}>
              <ModuleContentView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_PEOPLE}>
              <PeopleView />
            </Route>
          </Switch>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default AcceleratorRouter;
