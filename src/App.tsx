/* eslint-disable import/no-webpack-loader-syntax */
import {createStyles, CssBaseline, makeStyles, ThemeProvider,} from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch,} from 'react-router-dom';
import {RecoilRoot} from 'recoil';
import TopBar from './components/TopBar';
import NavBar from './components/NavBar';
import AllPlants from './components/plants/AllPlants';
import Dashboard from './components/plants/Dashboard';
import Species from './components/plants/Species';
import Accession from './components/seeds/accession';
import Database from './components/seeds/database';
import Help from './components/seeds/help';
import NewAccession from './components/seeds/newAccession';
import Summary from './components/seeds/summary';
import Snackbar from './components/Snackbar';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import useTimer from './utils/useTimer';
import getOrganization, {getOrganizationResponse, OrgRequestError} from './api/organization/organization';
import {Organization} from './types/Organization';

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

const emptyOrg: Organization = {
  projects: [],
  sites: [],
  facilities: [],
  layers: [],
};

function AppContent() {
  const classes = useStyles();
  useTimer();

  const [organizationErrors, setOrganizationErrors] = useState<OrgRequestError>();
  const [organization, setOrganization] = useState<Organization>(emptyOrg);
  const [currProjectId, setCurrProjectId] = useState<number | undefined>();

  useEffect(() => {
    getOrganization()
      .then((response: getOrganizationResponse) => {
        if (response.error) {
          setOrganizationErrors(response.error);
        } else {
          setOrganization(response.organization);
          setCurrProjectId(response.organization.projects[0].id);
        }
      });
  }, []);

  if (organizationErrors === OrgRequestError.AxiosError) {
    return <h1>Whoops! Looks like an unrecoverable internal error when fetching projects and/or sites</h1>;
  } else if (organizationErrors === OrgRequestError.NoProjects ||
             organizationErrors === OrgRequestError.NoSites) {
    return <h1>You don't have access to any projects or sites!</h1>;
  }

  return (
    <>
      <CssBaseline />
      <Snackbar />
      <>
        <div>
          <NavBar />
        </div>
        <div className={classes.content}>
          <TopBar projects={organization.projects} currProjectId={currProjectId} setCurrProjectId={setCurrProjectId}/>
          <ErrorBoundary>
            <Switch>
              <Route exact path='/'>
                <Redirect to='/dashboard' />
              </Route>
              <Route path='/dashboard' component={Dashboard} />
              <Route path='/plants' component={AllPlants} />
              <Route path='/species' component={Species} />
              <Route path='/help' component={Help} />
              <Route path='/summary' component={Summary} />
              <Route path='/accessions/new' component={NewAccession} />
              <Route path='/accessions/:accessionId' component={Accession} />
              <Route path='/accessions' component={Database} />
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}
