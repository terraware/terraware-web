/* eslint-disable import/no-webpack-loader-syntax */
import { CircularProgress, createStyles, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { getOrganizations } from 'src/api/organization/organization';
import {
  DEFAULT_SEED_SEARCH_FILTERS,
  DEFAULT_SEED_SEARCH_SORT_ORDER,
  SeedSearchSortOrder,
  SeedSearchCriteria,
} from 'src/api/seeds/search';
import { getUser } from 'src/api/user/user';
import ContactUs from 'src/components/ContactUs';
import EditOrganization from 'src/components/EditOrganization';
import Home from 'src/components/Home';
import NoOrgLandingPage from 'src/components/emptyStatePages/NoOrgLandingPage';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import NavBar from 'src/components/NavBar';
import NewPerson from 'src/components/Person/NewPerson';
import NewProject from 'src/components/NewProject';
import NewSite from 'src/components/NewSite';
import Organization from 'src/components/Organization';
import People from 'src/components/People';
import PersonDetails from 'src/components/Person';
import PlantDashboard from 'src/components/plants/PlantDashboard';
import PlantList from 'src/components/plants/PlantList';
import SpeciesList from 'src/components/plants/Species';
import Project from 'src/components/Project';
import ProjectsList from 'src/components/Projects';
import Accession from 'src/components/seeds/accession';
import CheckIn from 'src/components/seeds/checkin';
import Database from 'src/components/seeds/database';
import { defaultPreset as DefaultColumns } from 'src/components/seeds/database/columns';
import Help from 'src/components/seeds/help';
import NewAccession from 'src/components/seeds/newAccession';
import SeedSummary from 'src/components/seeds/summary';
import SiteView from 'src/components/Site';
import SitesList from 'src/components/Sites';
import Snackbar from 'src/components/Snackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import UserMenu from 'src/components/UserMenu';
import ErrorBoundary from 'src/ErrorBoundary';
import strings from 'src/strings';
import theme from 'src/theme';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { PlantSearchOptions } from 'src/types/Plant';
import { User } from 'src/types/User';
import { getAllSites } from 'src/utils/organization';

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
      height: '100%',
      paddingTop: '64px',
      overflow: 'scroll',
    },
    spinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      margin: 'auto',
      minHeight: '100vh',
      '& .MuiCircularProgress-svg': {
        color: '#007DF2',
        height: '193px',
      },
    },
    errorBox: {
      width: '30%',
      marginTop: '120px',
    },
  })
);

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'FAILED_NO_AUTH',
  'SUCCEEDED',
}

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
  const [orgAPIRequestStatus, setOrgAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  // get the selected values on database to pass it to new accession page
  const [organizations, setOrganizations] = useState<ServerOrganization[]>();
  const [user, setUser] = useState<User>();

  const reloadData = useCallback(() => {
    const populateOrganizations = async () => {
      const response = await getOrganizations();
      if (!response.error) {
        setOrgAPIRequestStatus(APIRequestStatus.SUCCEEDED);
        setOrganizations(response.organizations);
      } else if (response.error === 'NotAuthenticated') {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED_NO_AUTH);
      } else {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED);
      }
    };
    populateOrganizations();
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    if (organizations) {
      if (!selectedOrganization) {
        setSelectedOrganization(organizations[0]);
      } else {
        // update selectedOrganization
        const previousSelectedOrganization = organizations?.find((org) => org.id === selectedOrganization.id);
        if (previousSelectedOrganization) {
          setSelectedOrganization(previousSelectedOrganization);
        }
      }
    }
  }, [organizations, selectedOrganization]);

  useEffect(() => {
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded) {
        setUser(response.user ?? undefined);
      }
    };
    populateUser();
  }, []);

  if (orgAPIRequestStatus === APIRequestStatus.AWAITING || orgAPIRequestStatus === APIRequestStatus.FAILED_NO_AUTH) {
    return <CircularProgress className={classes.spinner} size='193' />;
  }

  if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
    return (
      <Switch>
        <Route exact path='/error'>
          <ErrorBox
            title={strings.ORGANIZATION_DATA_NOT_AVAILABLE}
            text={strings.CONTACT_US_TO_RESOLVE_ISSUE}
            className={classes.errorBox}
          />
        </Route>

        <Route path='*'>
          <Redirect to='/error' />
        </Route>
      </Switch>
    );
  }

  if (orgAPIRequestStatus === APIRequestStatus.SUCCEEDED && organizations?.length === 0) {
    return (
      <Switch>
        <Route exact path='/welcome'>
          <TopBar>
            <UserMenu userName={`${user?.firstName} ${user?.lastName}`} />
          </TopBar>
          <NoOrgLandingPage reloadOrganizationData={reloadData} />
        </Route>

        <Route path='*'>
          <Redirect to='/welcome' />
        </Route>
      </Switch>
    );
  }

  const organizationWithoutSB = () => {
    if (selectedOrganization) {
      return {
        ...selectedOrganization,
        projects: selectedOrganization?.projects?.filter((proj) => !proj.hidden),
      };
    }
  };

  const selectedOrgHasProjects = (): boolean => {
    const selected = organizationWithoutSB();
    return selected && selected.projects && selected.projects.length > 0 ? true : false;
  };

  const selectedOrgHasSites = (): boolean => {
    const selected = organizationWithoutSB();
    return selected && getAllSites(selected).length > 0 ? true : false;
  };

  const getSitesView = (): JSX.Element => {
    if (selectedOrgHasSites()) {
      return <SitesList organization={selectedOrganization}/>;
    }
    if (selectedOrgHasProjects()) {
      return <EmptyStatePage pageName={'Sites'} />;
    }

    return <EmptyStatePage pageName={'Projects'} />;
  };

  const filteredOrganization = () => {
    if (selectedOrganization) {
      return {
        ...selectedOrganization,
        projects: selectedOrganization?.projects?.filter((proj) => proj.hidden && proj.name === 'Seed Bank'),
      };
    }
  };

  return (
    <>
      <CssBaseline />
      <Snackbar />
      <>
        <div>
          <NavBar organization={selectedOrganization} />
        </div>
        <div className={`${classes.content} scrollable-content`}>
          <TopBar>
            <TopBarContent
              notifications={notifications}
              setNotifications={setNotifications}
              setSeedSearchCriteria={setSeedSearchCriteria}
              facilityId={facilityIdSelected}
              organizations={organizations}
              selectedOrganization={selectedOrganization}
              setSelectedOrganization={setSelectedOrganization}
              reloadOrganizationData={reloadData}
              userName={`${user?.firstName} ${user?.lastName}`}
            />
          </TopBar>
          <ErrorBoundary>
            <Switch>
              {/* Routes, in order of their appearance down the side nav bar and then across the top nav bar. */}
              <Route exact path='/home'>
                <Home organization={selectedOrganization} />
              </Route>
              <Route exact path='/seeds-summary'>
                <SeedSummary
                  organization={filteredOrganization()}
                  setSeedSearchCriteria={setSeedSearchCriteria}
                  notifications={notifications}
                  setFacilityIdSelected={setFacilityIdSelected}
                />
              </Route>
              <Route exact path='/checkin'>
                <CheckIn organization={selectedOrganization} />
              </Route>
              {selectedOrganization && (
                <Route exact path='/accessions/new'>
                  <NewAccession organization={selectedOrganization} />
                </Route>
              )}
              <Route exact path='/accessions'>
                <Database
                  organization={filteredOrganization()}
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
                <Accession organization={selectedOrganization} />
              </Route>
              <Route exact path='/plants-dashboard'>
                <PlantDashboard organization={organizationWithoutSB()} />
              </Route>
              <Route exact path='/plants-list'>
                <PlantList
                  organization={organizationWithoutSB()}
                  filters={plantListFilters}
                  setFilters={setPlantListFilters}
                />
              </Route>
              {selectedOrganization && (
                <Route exact path='/species'>
                  <SpeciesList organization={selectedOrganization} />
                </Route>
              )}
              {selectedOrganization && (
                <Route path='/projects/new'>
                  <NewProject organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route exact path='/projects'>
                {selectedOrgHasProjects() ? (
                  <ProjectsList organization={organizationWithoutSB()} />
                ) : (
                  <EmptyStatePage pageName={'Projects'} />
                )}
              </Route>
              {selectedOrganization && (
                <Route path='/projects/:projectId/edit' exact={true}>
                  <NewProject organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path='/projects/:projectId'>
                <Project organization={selectedOrganization} />
              </Route>
              {selectedOrganization && (
                <Route path='/sites/new'>
                  <NewSite organization={organizationWithoutSB()!} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route exact path='/sites'>
                {getSitesView()}
              </Route>
              {selectedOrganization && (
                <Route path='/sites/:siteId/edit' exact={true}>
                  <NewSite organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path='/sites/:siteId'>
                <SiteView organization={selectedOrganization} />
              </Route>
              <Route path='/help' component={Help}>
                <Help />
              </Route>
              {selectedOrganization && (
                <Route path='/organization/edit' exact={true}>
                  <EditOrganization organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path='/organization'>
                <Organization organization={organizationWithoutSB()} />
              </Route>
              {selectedOrganization && (
                <Route path='/people/new'>
                  <NewPerson organization={organizationWithoutSB()!} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route exact path='/people'>
                <People organization={selectedOrganization} />
              </Route>
              <Route path='/people/:personId'>
                <PersonDetails organization={organizationWithoutSB()} />
              </Route>
              <Route exact path='/contactus'>
                <ContactUs />
              </Route>

              {/* Redirects. Invalid paths will redirect to the closest valid path. */}
              <Route path='/contactus/'>
                <Redirect to='/contactus' />
              </Route>
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
              <Route path='/projects/new/'>
                <Redirect to='/projects/new' />
              </Route>
              <Route path='/projects/'>
                <Redirect to='/projects' />
              </Route>
              <Route path='/organization/'>
                <Redirect to='/organization' />
              </Route>
              <Route path='/sites/'>
                <Redirect to='/sites' />
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
    </>
  );
}
