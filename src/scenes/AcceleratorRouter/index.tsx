import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Slide, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation from 'src/utils/useStateLocation';
import { getRgbaFromHex } from 'src/utils/color';
import AcceleratorDeliverablesView from 'src/scenes/AcceleratorRouter/AcceleratorDeliverablesView';
import AcceleratorModuleContentView from 'src/scenes/AcceleratorRouter/AcceleratorModuleContentView';
import AcceleratorOverviewView from 'src/scenes/AcceleratorRouter/AcceleratorOverviewView';
import AcceleratorPeopleView from 'src/scenes/AcceleratorRouter/AcceleratorPeopleView';
import NavBar from 'src/scenes/AcceleratorRouter/NavBar';

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
              <AcceleratorOverviewView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_DELIVERABLES}>
              <AcceleratorDeliverablesView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_MODULE_CONTENT}>
              <AcceleratorModuleContentView />
            </Route>
            <Route path={APP_PATHS.ACCELERATOR_PEOPLE}>
              <AcceleratorPeopleView />
            </Route>
          </Switch>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default AcceleratorRouter;
