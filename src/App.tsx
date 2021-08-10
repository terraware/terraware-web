import { CssBaseline, Grid, ThemeProvider } from '@material-ui/core';
import React from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';
import AllPlants from './components/AllPlants';
import AppBar from './components/AppBar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import NavBar from './components/NavBar';
import Snackbar from './components/Snackbar';
import Species from './components/Species';
import ErrorBoundary from './ErrorBoundary';
import sessionSelector from './state/selectors/session';
import theme from './theme';
import useCheckJWT from './utils/useCheckJWT';

export default function App() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={'loading'}>
          <Router>
            <AppContent />
          </Router>
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}

function AppContent() {
  const session = useRecoilValue(sessionSelector);
  const history = useHistory();
  useCheckJWT();

  React.useEffect(() => {
    if (session) {
      history.push('/dashboard');
    } else {
      history.push('/');
    }
  }, [session, history]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Snackbar />
      {!session && <Route exact path='/' component={Login} />}
      {session && (
        <Grid container spacing={3}>
          <Grid item xs={1}>
            <NavBar />
          </Grid>
          <Grid item xs={11}>
            <AppBar />
            <Switch>
              <Route exact path='/dashboard' component={Dashboard} />
              <Route exact path='/plants' component={AllPlants} />
              <Route exact path='/species' component={Species} />
            </Switch>
          </Grid>
        </Grid>
      )}
    </ThemeProvider>
  );
}
