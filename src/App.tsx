import {
  createStyles,
  CssBaseline,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';
import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Accession from './components/accession';
import AllPlants from './components/AllPlants';
import AppBar from './components/AppBar';
import Dashboard from './components/Dashboard';
import Database from './components/database';
import Help from './components/help';
import NavBar from './components/NavBar';
import NewAccession from './components/newAccession';
import Snackbar from './components/Snackbar';
import Species from './components/Species';
import Summary from './components/summary';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import useTimer from './utils/useTimer';

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
  const location = useLocation();
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
              <Route
                path='/accessions/:accessionNumber'
                component={Accession}
              />
              <Route path='/accessions' component={Database} />
              <Route path='/species' component={Species} />
              <Route path='/help' component={Help} />
              <Route exact path='/summary' component={Summary} />
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}
