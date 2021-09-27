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
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AllPlants from './components/AllPlants';
import AppBar from './components/AppBar';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
import Snackbar from './components/Snackbar';
import Species from './components/Species';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import axios from 'axios';

export default function App() {
  axios.defaults.withCredentials = true;

  axios.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
      const redirect = encodeURIComponent(window.location.href);
      window.location.href = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/login?redirect=${redirect}`;

      return null;
    } else {
      return Promise.reject(error);
    }
  });

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

  return (
    <>
      <CssBaseline />
      <Snackbar />
      <>
        <div>
          <NavBar />
        </div>
        <div className={classes.content}>
          {/*<AppBar /> TODO FIX THIS*/}
          <ErrorBoundary>
            <Switch>
              <Route exact path='/'>
                <Redirect to='/dashboard' />
              </Route>
              <Route exact path='/dashboard' component={Dashboard} />
              <Route exact path='/plants' component={AllPlants} />
              <Route exact path='/species' component={Species} />
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}
