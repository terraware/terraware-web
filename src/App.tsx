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
import getOrganization, {GetOrganizationResponse, OrgRequestError} from './api/organization/organization';
import {Organization} from './types/Organization';
import {PlantErrorByLayerId, PlantsByLayerId, PlantSummariesByLayerId} from './types/Plant';
import {
  getPlants,
  GetPlantsResponse,
  getPlantSummaries,
} from './api/plants2/plants';

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
  // Temporary state used to populate the Projects dropdown. Unclear if this state will live here
  // after the refactor is finished.
  const [currProjectId, setCurrProjectId] = useState<number>();
  const [plantsByLayerId, setPlantsByLayerId] = useState<PlantsByLayerId>();
  const [plantErrorByLayerId, setPlantErrorByLayerId] = useState<PlantErrorByLayerId>();
  const [plantSummariesByLayerId, setPlantSummariesByLayerId] = useState<PlantSummariesByLayerId>();
  const [plantSummaryErrorByLayerId, setPlantSummaryErrorByLayerId] = useState<PlantErrorByLayerId>();

  useEffect(() => {
    const populateOrganizationData = async () => {
      const response: GetOrganizationResponse = await getOrganization();
      if (response.errors.length > 0) {
        setOrganizationErrors(response.errors);
      }
      setOrganization(response.organization);
      // Temporary way to choose default project for Projects dropdown.
      if (response.organization.projects.length > 0) {
        setCurrProjectId(response.organization.projects[0].id);
      }
    };

    populateOrganizationData();
  }, []);

  useEffect(() => {
    const populatePlantList = async () => {
      const promises = organization.layers.map((layer) => (getPlants(layer.id)));
      const plantsResponseList : GetPlantsResponse[] = await Promise.all(promises);

      const currPlantsByLayerId: PlantsByLayerId = new Map();
      const currPlantErrorByLayerId: PlantErrorByLayerId = new Map();
      plantsResponseList.forEach((plantResponse) => {
        if (plantResponse.error) {
          currPlantErrorByLayerId.set(plantResponse.layerId, plantResponse.error);
        } else {
          currPlantsByLayerId.set(plantResponse.layerId, plantResponse.plants);
        }
      });

      setPlantsByLayerId(currPlantsByLayerId);
      setPlantErrorByLayerId(currPlantErrorByLayerId);
    };

    const populatePlantSummaries = async() => {
      const response = await getPlantSummaries(organization.layers.map((layer) => (layer.id)));
      setPlantSummariesByLayerId(response.plantSummariesByLayerId);
      setPlantSummaryErrorByLayerId(response.plantErrorByLayerId);
    };

    if (organization.layers.length > 0) {
      populatePlantList();
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
          {/* Also temporary since projects dropdown will probably not continue to live in the top nav bar. */}
          <TopBar projects={organization.projects} currProjectId={currProjectId} setCurrProjectId={setCurrProjectId}/>
          <ErrorBoundary>
            <Switch>
              <Route exact path='/'>
                <Redirect to='/dashboard' />
              </Route>
              <Route exact path='/dashboard' component={Dashboard} />
              <Route exact path='/plants' component={AllPlants} />
              <Route path='/species' component={Species} />
              <Route path='/accessions/new' component={NewAccession} />
              <Route path='/accessions/:accessionId' component={Accession} />
              <Route path='/accessions' component={Database} />
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
