/* eslint-disable import/no-webpack-loader-syntax */
import {createStyles, CssBaseline, makeStyles, ThemeProvider,} from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch,} from 'react-router-dom';
import {RecoilRoot} from 'recoil';
import TopBar from './components/TopBar';
import NavBar from './components/NavBar';
import PlantsList from './components/plants/PlantsList';
import PlantsDashboard from './components/plants/PlantsDashboard';
import Species from './components/plants/Species';
import Accession from './components/seeds/accession';
import Database from './components/seeds/database';
import Help from './components/seeds/help';
import NewAccession from './components/seeds/newAccession';
import SeedSummary from './components/seeds/summary';
import Snackbar from './components/Snackbar';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import useTimer from './utils/useTimer';
import getOrganization, {GetOrganizationResponse, OrgRequestError} from 'src/api/organization/organization';
import {Organization} from 'src/types/Organization';
import {PlantErrorByLayerId, PlantsByLayerId, PlantSummariesByLayerId} from 'src/types/Plant';
import {SpeciesById} from 'src/types/Species';
import {
  getPlantsAndSpecies,
  getPlantSummaries,
} from 'src/api/plants2/plants';
import PageHeader from './components/seeds/PageHeader';

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

  const [organization, setOrganization] = useState<Organization>(emptyOrg);
  const [organizationErrors, setOrganizationErrors] = useState<OrgRequestError[]>([]);
  const [plantsByLayerId, setPlantsByLayerId] = useState<PlantsByLayerId>();
  const [plantErrorByLayerId, setPlantErrorByLayerId] = useState<PlantErrorByLayerId>();
  const [speciesById, setSpeciesById] = useState<SpeciesById>();
  const [plantSummariesByLayerId, setPlantSummariesByLayerId] = useState<PlantSummariesByLayerId>();
  const [plantSummaryErrorByLayerId, setPlantSummaryErrorByLayerId] = useState<PlantErrorByLayerId>();

  useEffect(() => {
    const populateOrganizationData = async () => {
      const response: GetOrganizationResponse = await getOrganization();
      if (response.errors.length > 0) {
        setOrganizationErrors(response.errors);
      }
      setOrganization(response.organization);
    };

    populateOrganizationData();
  }, []);

  useEffect(() => {
    const populatePlantsAndSpecies = async () => {
      const response = await getPlantsAndSpecies(organization.layers.map((layer) => layer.id));
      setPlantsByLayerId(response.plantsByLayerId);
      setPlantErrorByLayerId(response.plantErrorByLayerId);
      if (response.speciesRequestSucceeded) {
        setSpeciesById(response.speciesById);
      }
    };

    const populatePlantSummaries = async() => {
      const response = await getPlantSummaries(organization.layers.map((layer) => (layer.id)));
      setPlantSummariesByLayerId(response.plantSummariesByLayerId);
      setPlantSummaryErrorByLayerId(response.plantErrorByLayerId);
    };

    if (organization.layers.length > 0) {
      populatePlantsAndSpecies();
      populatePlantSummaries();
    }
  }, [organization]);

  // Temporary error UI. Will be made prettier once we have input from the Design Team.
  if (organizationErrors.includes(OrgRequestError.ErrorFetchingProjectsOrSites)) {
    return <h1>Whoops! Looks like an unrecoverable internal error when fetching projects and/or sites</h1>;
  } else if (organizationErrors.includes(OrgRequestError.NoProjects) ||
             organizationErrors.includes(OrgRequestError.NoSites)) {
    return <h1>You don't have access to any projects and/or sites!</h1>;
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
          <TopBar/>
          <ErrorBoundary>
            <Switch>
              {/* Routes, in order of their appearance down the side nav bar and then across the top nav bar. */}
              <Route exact path='/home'>
                {/* Temporary homepage. Needs to be updated with input from the Design Team. */}
                <main><PageHeader title='Welcome to Terraware!' subtitle=''/></main>
              </Route>
              <Route exact path='/seeds-summary'>
                <SeedSummary />
              </Route>
              <Route exact path='/accessions/new'>
                <NewAccession />
              </Route>
              <Route exact path='/accessions'>
                <Database />
              </Route>
              <Route path='/accessions/:accessionId'>
                <Accession />
              </Route>
              <Route exact path='/plants-dashboard'>
                <PlantsDashboard />
              </Route>
              <Route exact path='/plants-list'>
                <PlantsList />
              </Route>
              <Route exact path='/species'>
                <Species />
              </Route>
              <Route path='/help' component={Help}>
                <Help />
              </Route>

              {/* Redirects. Invalid paths will redirect to the closest valid path. */}
              <Route path='/plants-dashboard/'><Redirect to='/plants-dashboard'/></Route>
              <Route path='/plants-list/'><Redirect to='/plants-list'/></Route>
              <Route path='/seeds-summary/'><Redirect to='/seeds-summary'/></Route>
              <Route path='/accessions/new/'><Redirect to='/accessions/new'/></Route>
              <Route path='/species/'><Redirect to='/species'/></Route>
              <Route path='/help/'><Redirect to='/help'/></Route>
              <Route path='/'><Redirect to='/home' /></Route>
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}
