/* eslint-disable import/no-webpack-loader-syntax */
import { createStyles, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppBar from './components/AppBar';
import NavBar from './components/NavBar';
import AllPlants from './components/plants/AllPlants';
import Dashboard from './components/plants/Dashboard';
import Species from './components/plants/Species';
import Accession from './components/seeds/accession';
import Checkin from './components/seeds/checkin';
import Database from './components/seeds/database';
import Help from './components/seeds/help';
import NewAccession from './components/seeds/newAccession';
import Summary from './components/seeds/summary';
import Snackbar from './components/Snackbar';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import useTimer from './utils/useTimer';

// @ts-ignore
mapboxgl.workerClass =
  // tslint:disable-next-line: no-var-requires
  require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

export default function App() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={strings.LOADING}>
          <Router>
            <ThemeProvider theme={theme}>
              <AppContent />
            </ThemeProvider>
          </Router>
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      marginLeft: '200px',
    },
  })
);

function AppContent() {
  const classes = useStyles();
  useTimer();

  return (
    <>
      <CssBaseline />
      <Snackbar />
      <>
        <div>
          <NavBar />
        </div>
        <div className={classes.content}>
          <AppBar />
          <ErrorBoundary>
            <Switch>
              <Route exact path='/'>
                <Redirect to='/dashboard' />
              </Route>
              <Route exact path='/dashboard' component={Dashboard} />
              <Route exact path='/plants' component={AllPlants} />
              <Route exact path='/species' component={Species} />
              <Route path='/accessions/new' component={NewAccession} />
              <Route path='/accessions/:accessionId' component={Accession} />
              <Route path='/accessions' component={Database} />
              <Route path='/species' component={Species} />
              <Route path='/help' component={Help} />
              <Route exact path='/summary' component={Summary} />
              <Route exact path='/checkin' component={Checkin} />
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}
