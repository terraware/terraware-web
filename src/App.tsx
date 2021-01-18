<<<<<<< HEAD
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
=======
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Database from './pages/Database';
import SiteLocations from './pages/SiteLocations';
import Species from './pages/Species';
import Summary from './pages/Summary';

const drawerWidth = 200;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      backgroundColor: 'white',
      color: 'black',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      background: '#EAEAEA',
    },
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      display: 'flex',
      paddingLeft: '16px',
      alignItems: 'center',
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker
    },
  })
);

<<<<<<< HEAD
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
          <AppBar />
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
=======
const ROUTES = [
  {
    title: 'Summary',
    link: '/',
  },
  {
    title: 'Database',
    link: '/database',
  },
  {
    title: 'Species',
    link: '/species',
  },
  {
    title: 'Site Locations',
    link: '/locations',
  },
];

export default function App(): JSX.Element {
  const classes = useStyles();

  return (
    <Router>
      <RecoilRoot>
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="fixed" className={classes.appBar} elevation={1}>
            <Toolbar>
              <Typography variant="h6" noWrap />
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left"
          >
            <div className={classes.toolbar}>
              <Typography variant="h6" noWrap>
                Seed Bank App
              </Typography>
            </div>
            <Divider />
            <List>
              {ROUTES.map(({ title, link }) => (
                <ListItem key={title} component={Link} to={link}>
                  <ListItemText primary={title} />
                </ListItem>
              ))}
            </List>
          </Drawer>
          <Route exact path="/" component={Summary} />
          <Route path="/database" component={Database} />
          <Route path="/species" component={Species} />
          <Route path="/locations" component={SiteLocations} />
        </div>
      </RecoilRoot>
    </Router>
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker
  );
}
