/* eslint-disable import/no-webpack-loader-syntax */
import { createStyles, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import getOrganization, { GetOrganizationResponse, OrgRequestError } from 'src/api/organization/organization';
import {
  DEFAULT_SEED_SEARCH_FILTERS,
  DEFAULT_SEED_SEARCH_SORT_ORDER,
  SearchField,
  SeedSearchSortOrder,
  SeedSearchCriteria,
} from 'src/api/seeds/search';
import { Notifications } from 'src/types/Notifications';
import { Organization } from 'src/types/Organization';
import { PlantSearchOptions } from 'src/types/Plant';
import NavBar from './components/NavBar';
import PlantDashboard from './components/plants/PlantDashboard';
import PlantList from './components/plants/PlantList';
import SpeciesList from './components/plants/Species';
import Accession from './components/seeds/accession';
import CheckIn from './components/seeds/checkin';
import Database from './components/seeds/database';
import Help from './components/seeds/help';
import NewAccession from './components/seeds/newAccession';
import PageHeader from './components/seeds/PageHeader';
import SeedSummary from './components/seeds/summary';
import Snackbar from './components/Snackbar';
import TopBar from './components/TopBar';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import { defaultPreset as DefaultColumns } from './components/seeds/database/columns';

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
  plantLayers: [],
};

function AppContent() {
  const classes = useStyles();
  const [organization, setOrganization] = useState<Organization>(emptyOrg);
  const [organizationErrors, setOrganizationErrors] = useState<OrgRequestError[]>([]);
  const [currFacilityId, setCurrFacilityId] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notifications>();
  const [plantListFilters, setPlantListFilters] = useState<PlantSearchOptions>();

  // seedSearchCriteria describes which criteria to apply when searching accession data.
  const [seedSearchCriteria, setSeedSearchCriteria] = useState<SeedSearchCriteria>(DEFAULT_SEED_SEARCH_FILTERS);

  // seedSearchSort describes which sort criterion to apply when searching accession data.
  const [seedSearchSort, setSeedSearchSort] = useState<SeedSearchSortOrder>(DEFAULT_SEED_SEARCH_SORT_ORDER);

  // seedSearchColumns describes which accession columns to request when searching accession data.
  const [seedSearchColumns, setSeedSearchColumns] = useState<SearchField[]>(DefaultColumns.fields);

  /*
   * accessionsDisplayColumns describes which columns are displayed in the accessions list, and in which order.
   * Differs from seedSearchSelectedColumns because the order matters. Also, sometimes the two lists won't have
   * exactly the same columns. E.g. if the user adds the Withdrawal -> "Seeds Withdrawn" column,
   * then seedSearchSelectedColumns will contain withdrawalQuantity and withdrawalUnits but this list will only
   * contain withdrawalQuantity.
   */
  const [accessionsDisplayColumns, setAccessionsDisplayColumns] = useState<SearchField[]>(DefaultColumns.fields);

  useEffect(() => {
    const populateOrganizationData = async () => {
      const response: GetOrganizationResponse = await getOrganization();
      if (response.errors.length > 0) {
        setOrganizationErrors(response.errors);
      }
      setOrganization(response.organization);
      if (response.organization.facilities.length > 0) {
        setCurrFacilityId(response.organization.facilities[0].id);
      }
    };

    populateOrganizationData();
  }, []);

  // Temporary error UI. Will be made prettier once we have input from the Design Team.
  if (organizationErrors.includes(OrgRequestError.ErrorFetchingProjectsOrSites)) {
    return <h1>Whoops! Looks like an unrecoverable internal error when fetching projects and/or sites</h1>;
  } else if (
    organizationErrors.includes(OrgRequestError.NoProjects) ||
    organizationErrors.includes(OrgRequestError.NoSites)
  ) {
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
          <TopBar
            notifications={notifications}
            setNotifications={setNotifications}
            setSeedSearchCriteria={setSeedSearchCriteria}
            currFacilityId={currFacilityId}
          />
          <ErrorBoundary>
            <Switch>
              {/* Routes, in order of their appearance down the side nav bar and then across the top nav bar. */}
              <Route exact path='/home'>
                {/* Temporary homepage. Needs to be updated with input from the Design Team. */}
                <main>
                  <PageHeader title='Welcome to Terraware!' subtitle='' />
                </main>
              </Route>
              <Route exact path='/seeds-summary'>
                <SeedSummary
                  facilityId={currFacilityId}
                  setSeedSearchCriteria={setSeedSearchCriteria}
                  notifications={notifications}
                />
              </Route>
              <Route exact path='/checkin'>
                <CheckIn facilityId={currFacilityId} />
              </Route>
              <Route exact path='/accessions/new'>
                <NewAccession facilityId={currFacilityId} />
              </Route>
              <Route exact path='/accessions'>
                <Database
                  facilityId={currFacilityId}
                  searchCriteria={seedSearchCriteria}
                  setSearchCriteria={setSeedSearchCriteria}
                  searchSortOrder={seedSearchSort}
                  setSearchSortOrder={setSeedSearchSort}
                  searchColumns={seedSearchColumns}
                  setSearchColumns={setSeedSearchColumns}
                  displayColumnNames={accessionsDisplayColumns}
                  setDisplayColumnNames={setAccessionsDisplayColumns}
                />
              </Route>
              <Route path='/accessions/:accessionId'>
                <Accession />
              </Route>
              <Route exact path='/plants-dashboard'>
                <PlantDashboard organization={organization} />
              </Route>
              <Route exact path='/plants-list'>
                <PlantList organization={organization} filters={plantListFilters} setFilters={setPlantListFilters} />
              </Route>
              <Route exact path='/species'>
                <SpeciesList />
              </Route>
              <Route path='/help' component={Help}>
                <Help />
              </Route>

              {/* Redirects. Invalid paths will redirect to the closest valid path. */}
              <Route path='/plants-dashboard/'>
                <Redirect to='/plants-dashboard' />
              </Route>
              <Route path='/plants-list/'>
                <Redirect to='/plants-list' />
              </Route>
              <Route path='/seeds-summary/'>
                <Redirect to='/seeds-summary' />
              </Route>
              <Route path='/accessions/new/'>
                <Redirect to='/accessions/new' />
              </Route>
              <Route path='/species/'>
                <Redirect to='/species' />
              </Route>
              <Route path='/help/'>
                <Redirect to='/help' />
              </Route>
              <Route path='/'>
                <Redirect to='/home' />
              </Route>
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}
