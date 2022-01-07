/* eslint-disable import/no-webpack-loader-syntax */
import { createStyles, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { getOrganizations } from 'src/api/organization/organization';
import {
  DEFAULT_SEED_SEARCH_FILTERS,
  DEFAULT_SEED_SEARCH_SORT_ORDER,
  SeedSearchSortOrder,
  SeedSearchCriteria,
} from 'src/api/seeds/search';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { PlantSearchOptions } from 'src/types/Plant';
import Home from './components/Home';
import NavBar from './components/NavBar';
import PlantDashboard from './components/plants/PlantDashboard';
import PlantList from './components/plants/PlantList';
import SpeciesList from './components/plants/Species';
import Accession from './components/seeds/accession';
import CheckIn from './components/seeds/checkin';
import Database from './components/seeds/database';
import Help from './components/seeds/help';
import NewAccession from './components/seeds/newAccession';
import SeedSummary from './components/seeds/summary';
import Snackbar from './components/Snackbar';
import TopBar from './components/TopBar';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import { defaultPreset as DefaultColumns } from './components/seeds/database/columns';
import { seedsDatabaseSelectedOrgInfo } from './state/selectedOrgInfoPerPage';

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
  const [selectedOrganization, setSelectedOrganization] = useState<ServerOrganization>();
  const [plantListFilters, setPlantListFilters] = useState<PlantSearchOptions>();
  const [notifications, setNotifications] = useState<Notifications>();

  // seedSearchCriteria describes which criteria to apply when searching accession data.
  const [seedSearchCriteria, setSeedSearchCriteria] = useState<SeedSearchCriteria>(DEFAULT_SEED_SEARCH_FILTERS);

  // seedSearchSort describes which sort criterion to apply when searching accession data.
  const [seedSearchSort, setSeedSearchSort] = useState<SeedSearchSortOrder>(DEFAULT_SEED_SEARCH_SORT_ORDER);

  // seedSearchColumns describes which accession columns to request when searching accession data.
  const [seedSearchColumns, setSeedSearchColumns] = useState<string[]>(DefaultColumns.fields);

  /*
   * accessionsDisplayColumns describes which columns are displayed in the accessions list, and in which order.
   * Differs from seedSearchSelectedColumns because the order matters. Also, sometimes the two lists won't have
   * exactly the same columns. E.g. if the user adds the Withdrawal -> "Seeds Withdrawn" column,
   * then seedSearchSelectedColumns will contain withdrawalQuantity and withdrawalUnits but this list will only
   * contain withdrawalQuantity.
   */
  const [accessionsDisplayColumns, setAccessionsDisplayColumns] = useState<string[]>(DefaultColumns.fields);

  /*
   * facilityIdSelected saves the value of the facilityId selected on "Accessions" and "Seeds summary" page.
   * We can then pass its value to "New accession page", when creating a new accession and to the top bar
   * to how notifications.
   */
  const [facilityIdSelected, setFacilityIdSelected] = useState<number>();
  const [organizationError, setOrganizationError] = useState<boolean>(false);
  // get the selected values on database to pass it to new accession page
  const selectedOrgInfoDatabase = useRecoilValue(seedsDatabaseSelectedOrgInfo);

  useEffect(() => {
    const populateOrganizations = async () => {
      const response = await getOrganizations();
      if (response.requestSucceeded) {
        setSelectedOrganization(response.organizations[0]);
      } else {
        setOrganizationError(true);
      }
    };
    populateOrganizations();
  }, []);

  if (organizationError) {
    return <h1>Could not fetch organization data</h1>;
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
            facilityId={facilityIdSelected}
          />
          <ErrorBoundary>
            <Switch>
              {/* Routes, in order of their appearance down the side nav bar and then across the top nav bar. */}
              <Route exact path='/home'>
                <Home organization={selectedOrganization} />
              </Route>
              <Route exact path='/seeds-summary'>
                <SeedSummary
                  organization={selectedOrganization}
                  setSeedSearchCriteria={setSeedSearchCriteria}
                  notifications={notifications}
                  setFacilityIdSelected={setFacilityIdSelected}
                />
              </Route>
              <Route exact path='/checkin'>
                <CheckIn organization={selectedOrganization} />
              </Route>
              <Route exact path='/accessions/new'>
                <NewAccession facilityId={selectedOrgInfoDatabase.selectedFacility?.id} />
              </Route>
              <Route exact path='/accessions'>
                <Database
                  organization={selectedOrganization}
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
                <PlantDashboard organization={selectedOrganization} />
              </Route>
              <Route exact path='/plants-list'>
                <PlantList
                  organization={selectedOrganization}
                  filters={plantListFilters}
                  setFilters={setPlantListFilters}
                />
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
