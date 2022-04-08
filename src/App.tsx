/* eslint-disable import/no-webpack-loader-syntax */
import { CircularProgress, createStyles, CssBaseline, makeStyles } from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
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
import NewAccession from 'src/components/seeds/newAccession';
import SeedSummary from 'src/components/seeds/summary';
import SiteView from 'src/components/Site';
import SitesList from 'src/components/Sites';
import Snackbar from 'src/components/Snackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import UserMenu from 'src/components/UserMenu';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { PlantSearchOptions } from 'src/types/Plant';
import { User } from 'src/types/User';
import { getAllSites } from 'src/utils/organization';
import { useMediaQuery } from 'react-responsive';

// @ts-ignore
mapboxgl.workerClass =
  // tslint:disable-next-line: no-var-requires
  require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      marginLeft: '200px',
      height: '100%',
      paddingTop: '64px',
      overflow: 'auto',
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
  })
);

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'FAILED_NO_AUTH',
  'SUCCEEDED',
}

export default function App() {
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
  const history = useHistory();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const reloadData = useCallback((selectedOrgId?: number) => {
    const populateOrganizations = async () => {
      const response = await getOrganizations();
      if (!response.error) {
        setOrgAPIRequestStatus(APIRequestStatus.SUCCEEDED);
        setOrganizations(response.organizations);
        if (selectedOrgId) {
          const orgToSelect = response.organizations.find((org) => org.id === selectedOrgId);
          if (orgToSelect) {
            setSelectedOrganization(orgToSelect);
          }
        }
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
      setSelectedOrganization((previouslySelectedOrg: ServerOrganization | undefined) => {
        const updatedOrg = organizations.find((org) => org.id === previouslySelectedOrg?.id);
        return updatedOrg ? updatedOrg : organizations[0];
      });
    }
  }, [organizations, selectedOrganization]);

  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded) {
        setUser(response.user ?? undefined);
      }
    };
    populateUser();
  }, []);

  useEffect(() => {
    reloadUser();
  }, [reloadUser]);

  if (orgAPIRequestStatus === APIRequestStatus.AWAITING || orgAPIRequestStatus === APIRequestStatus.FAILED_NO_AUTH) {
    return <CircularProgress className={classes.spinner} size='193' />;
  } else if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
    history.push(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
    return null;
  } else if (orgAPIRequestStatus === APIRequestStatus.SUCCEEDED && organizations?.length === 0) {
    history.push(APP_PATHS.WELCOME);
    return (
      <>
        <TopBar>
          <UserMenu user={user} reloadUser={reloadUser} />
        </TopBar>
        <NoOrgLandingPage reloadOrganizationData={reloadData} />
      </>
    );
  } else if (isMobile) {
    window.stop();
    history.push(APP_PATHS.ERROR_MOBILE_NOT_SUPPORTED);
    return null;
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
      return <SitesList organization={selectedOrganization} />;
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
      <Snackbar scope='app' />
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
              user={user}
              reloadUser={reloadUser}
            />
          </TopBar>
          <ErrorBoundary>
            <Switch>
              {/* Routes, in order of their appearance down the side NavBar */}
              <Route exact path={APP_PATHS.HOME}>
                <Home
                  organizations={organizations}
                  selectedOrganization={selectedOrganization}
                  setSelectedOrganization={setSelectedOrganization}
                />
              </Route>
              <Route exact path={APP_PATHS.SEEDS_DASHBOARD}>
                <SeedSummary
                  organization={filteredOrganization()}
                  setSeedSearchCriteria={setSeedSearchCriteria}
                  setFacilityIdSelected={setFacilityIdSelected}
                />
              </Route>
              <Route exact path={APP_PATHS.CHECKIN}>
                <CheckIn organization={selectedOrganization} />
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.ACCESSIONS_NEW}>
                  <NewAccession organization={selectedOrganization} />
                </Route>
              )}
              <Route path={APP_PATHS.ACCESSIONS_ITEM}>
                <Accession organization={selectedOrganization} />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS}>
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
              <Route exact path={APP_PATHS.PLANTS_DASHBOARD}>
                <PlantDashboard organization={organizationWithoutSB()} />
              </Route>
              <Route exact path={APP_PATHS.PLANTS_LIST}>
                <PlantList
                  organization={organizationWithoutSB()}
                  filters={plantListFilters}
                  setFilters={setPlantListFilters}
                />
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SPECIES}>
                  <SpeciesList organization={selectedOrganization} />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.PROJECTS_NEW}>
                  <NewProject organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.PROJECTS_EDIT}>
                  <NewProject organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path={APP_PATHS.PROJECTS_VIEW}>
                <Project organization={selectedOrganization} />
              </Route>
              <Route exact path={APP_PATHS.PROJECTS}>
                {selectedOrgHasProjects() ? (
                  <ProjectsList organization={organizationWithoutSB()} />
                ) : (
                  <EmptyStatePage pageName={'Projects'} />
                )}
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SITES_NEW}>
                  <NewSite organization={organizationWithoutSB()!} reloadOrganizationData={reloadData} />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SITES_EDIT}>
                  <NewSite organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path={APP_PATHS.SITES_VIEW}>
                <SiteView organization={selectedOrganization} />
              </Route>
              <Route exact path={APP_PATHS.SITES}>
                {getSitesView()}
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.ORGANIZATION_EDIT}>
                  <EditOrganization organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route exact path={APP_PATHS.ORGANIZATION}>
                <Organization organization={organizationWithoutSB()} />
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.PEOPLE_NEW}>
                  <NewPerson organization={organizationWithoutSB()!} reloadOrganizationData={reloadData} />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.PEOPLE_EDIT}>
                  <NewPerson organization={organizationWithoutSB()!} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path={APP_PATHS.PEOPLE_VIEW}>
                <PersonDetails organization={organizationWithoutSB()} />
              </Route>
              <Route exact path={APP_PATHS.PEOPLE}>
                <People organization={selectedOrganization} />
              </Route>
              <Route exact path={APP_PATHS.CONTACT_US}>
                <ContactUs />
              </Route>

              {/* Redirects. Invalid paths will redirect to the closest valid path. */}
              {/* Only redirect 'major' paths, e.g. handle /projects/* not more granular projects paths */}
              {/* In alphabetical order for easy reference with APP_PATHS, except for /home which must go last */}
              <Route path={APP_PATHS.ACCESSIONS + '/'}>
                <Redirect to={APP_PATHS.ACCESSIONS} />
              </Route>
              <Route path={APP_PATHS.CHECKIN + '/'}>
                <Redirect to={APP_PATHS.CHECKIN} />
              </Route>
              <Route path={APP_PATHS.CONTACT_US + '/'}>
                <Redirect to={APP_PATHS.CONTACT_US} />
              </Route>
              <Route exact path={APP_PATHS.ORGANIZATION + '/'}>
                <Redirect to={APP_PATHS.ORGANIZATION} />
              </Route>
              <Route exact path={APP_PATHS.PEOPLE + '/'}>
                <Redirect to={APP_PATHS.PEOPLE} />
              </Route>
              <Route path={APP_PATHS.PLANTS_DASHBOARD + '/'}>
                <Redirect to={APP_PATHS.PLANTS_DASHBOARD} />
              </Route>
              <Route path={APP_PATHS.PLANTS_LIST + '/'}>
                <Redirect to={APP_PATHS.PLANTS_LIST} />
              </Route>
              <Route exact path={APP_PATHS.PROJECTS + '/'}>
                <Redirect to={APP_PATHS.PROJECTS} />
              </Route>
              <Route path={APP_PATHS.SEEDS_DASHBOARD + '/'}>
                <Redirect to={APP_PATHS.SEEDS_DASHBOARD} />
              </Route>
              <Route exact path={APP_PATHS.SITES + '/'}>
                <Redirect to={APP_PATHS.SITES} />
              </Route>
              <Route path={APP_PATHS.SPECIES + '/'}>
                <Redirect to={APP_PATHS.SPECIES} />
              </Route>
              <Route path='/'>
                <Redirect to={APP_PATHS.HOME} />
              </Route>
            </Switch>
          </ErrorBoundary>
        </div>
      </>
    </>
  );
}
