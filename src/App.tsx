import {
  createStyles,
  CssBaseline,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from 'react-router-dom';
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
import strings from './strings';
import theme from './theme';
import useCheckJWT from './utils/useCheckJWT';

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
    <>
      <CssBaseline />
      <Snackbar />
      {!session && <Route exact path='/' component={Login} />}
      {session && (
        <>
          <div>
            <NavBar />
          </div>
          <div className={classes.content}>
            <AppBar />
            <ErrorBoundary>
              <Switch>
                <Route exact path='/dashboard' component={Dashboard} />
                <Route exact path='/plants' component={AllPlants} />
                <Route exact path='/species' component={Species} />
              </Switch>
            </ErrorBoundary>
          </div>
        </>
      )}
    </>
  );
}
