/* eslint-disable import/no-webpack-loader-syntax */
import { CircularProgress, CssBaseline, Slide, StyledEngineProvider } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import useQuery from './utils/useQuery';
import useStateLocation, { getLocation } from './utils/useStateLocation';
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
import Organization from 'src/components/Organization';
import People from 'src/components/People';
import PersonDetails from 'src/components/Person';
import SpeciesList from 'src/components/Species';
import Accession from 'src/components/seeds/accession';
import CheckIn from 'src/components/seeds/checkin';
import Database from 'src/components/seeds/database';
import { defaultPreset as DefaultColumns } from 'src/components/seeds/database/columns';
import NewAccession from 'src/components/seeds/newAccession';
import SeedSummary from 'src/components/seeds/summary';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import MyAccount from './components/MyAccount';
import { getAllSpecies } from './api/species/species';
import { Species } from './types/Species';
import Monitoring from './components/Monitoring';
import SeedBanks from './components/SeedBanks';
import NewSeedBank from './components/NewSeedBank';
import SeedBankDetails from './components/SeedBank';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getPreferences, updatePreferences } from './api/preferences/preferences';
import useEnvironment from 'src/utils/useEnvironment';
import Accession2View from './components/accession2';

const useStyles = makeStyles(() => ({
  content: {
    height: '100%',
    paddingTop: '64px',
    overflow: 'auto',
  },
  contentWithNavBar: {
    marginLeft: '200px',
  },
  navBarOpened: {
    '& .blurred': {
      backdropFilter: 'blur(8px)',
      background: 'rgba(249, 250, 250, 0.8)',
      height: '100%',
      alignItems: 'center',
      position: 'fixed',
      zIndex: 1300,
      inset: '0px',
    },
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
}));

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'FAILED_NO_AUTH',
  'SUCCEEDED',
}

export default function App() {
  const classes = useStyles();
  const query = useQuery();
  const location = useStateLocation();
  const [selectedOrganization, setSelectedOrganization] = useState<ServerOrganization>();
  const [preferencesOrg, setPreferencesOrg] = useState<{ [key: string]: unknown }>();
  const [notifications, setNotifications] = useState<Notifications>();
  const { isProduction } = useEnvironment();

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

  const [orgAPIRequestStatus, setOrgAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  // get the selected values on database to pass it to new accession page
  const [organizations, setOrganizations] = useState<ServerOrganization[]>();
  const [user, setUser] = useState<User>();
  const history = useHistory();
  const { type } = useDeviceInfo();
  const [species, setSpecies] = useState<Species[]>([]);
  const [showNavBar, setShowNavBar] = useState(true);

  const reloadData = useCallback(async (selectedOrgId?: number) => {
    const populateOrganizations = async () => {
      const response = await getOrganizations();
      if (!response.error) {
        setOrgAPIRequestStatus(APIRequestStatus.SUCCEEDED);
        setOrganizations(response.organizations);
        if (selectedOrgId) {
          const orgToSelect = response.organizations.find((org) => org.id === selectedOrgId);
          if (orgToSelect) {
            setSelectedOrganization(orgToSelect);
            updatePreferences('lastVisitedOrg', orgToSelect.id);
          }
        }
      } else if (response.error === 'NotAuthenticated') {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED_NO_AUTH);
      } else {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED);
      }
    };
    await populateOrganizations();
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const reloadSpecies = useCallback(() => {
    const populateSpecies = async () => {
      if (selectedOrganization) {
        const response = await getAllSpecies(selectedOrganization.id);
        if (response.requestSucceeded) {
          setSpecies(response.species);
        }
      }
    };
    populateSpecies();
  }, [selectedOrganization]);

  useEffect(() => {
    reloadSpecies();
  }, [reloadSpecies]);

  useEffect(() => {
    const getUserPreferences = async () => {
      const response = await getPreferences();
      if (organizations && response.requestSucceeded) {
        setPreferencesOrg(response.preferences);
      }
    };
    getUserPreferences();
  }, [organizations, setPreferencesOrg]);

  useEffect(() => {
    if (organizations && preferencesOrg) {
      const organizationId = query.get('organizationId');
      const querySelectionOrg = organizationId && organizations.find((org) => org.id === parseInt(organizationId, 10));
      setSelectedOrganization((previouslySelectedOrg: ServerOrganization | undefined) => {
        let orgToUse = querySelectionOrg || organizations.find((org) => org.id === previouslySelectedOrg?.id);
        if (!orgToUse && preferencesOrg.lastVisitedOrg) {
          orgToUse = organizations.find((org) => org.id === preferencesOrg.lastVisitedOrg);
        }
        if (!orgToUse) {
          orgToUse = organizations[0];
        }
        if (orgToUse && preferencesOrg?.lastVisitedOrg !== orgToUse.id) {
          updatePreferences('lastVisitedOrg', orgToUse.id);
        }
        return orgToUse;
      });
      if (organizationId) {
        query.delete('organizationId');
        // preserve other url params
        history.push(getLocation(location.pathname, location, query.toString()));
      }
    }
  }, [organizations, selectedOrganization, query, location, history, preferencesOrg]);

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
    if (
      orgAPIRequestStatus === APIRequestStatus.SUCCEEDED &&
      organizations?.length === 0 &&
      location.pathname !== APP_PATHS.WELCOME
    ) {
      history.push(APP_PATHS.WELCOME);
    }
  }, [orgAPIRequestStatus, organizations, location, history]);

  useEffect(() => {
    reloadUser();
  }, [reloadUser]);

  useEffect(() => {
    if (type === 'mobile' || type === 'tablet') {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [type]);

  if (orgAPIRequestStatus === APIRequestStatus.AWAITING || orgAPIRequestStatus === APIRequestStatus.FAILED_NO_AUTH) {
    return (
      <StyledEngineProvider injectFirst>
        <CircularProgress className={classes.spinner} size='193' />
      </StyledEngineProvider>
    );
  } else if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
    history.push(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
    return null;
  } else if (orgAPIRequestStatus === APIRequestStatus.SUCCEEDED) {
    if (organizations?.length === 0) {
      return (
        <StyledEngineProvider injectFirst>
          <TopBar fullWidth={true}>
            <TopBarContent
              notifications={notifications}
              setNotifications={setNotifications}
              organizations={organizations}
              selectedOrganization={selectedOrganization}
              setSelectedOrganization={setSelectedOrganization}
              reloadOrganizationData={reloadData}
              user={user}
              reloadUser={reloadUser}
              setShowNavBar={setShowNavBar}
            />
          </TopBar>
          <ToastSnackbar />
          <NoOrgLandingPage reloadOrganizationData={reloadData} />
        </StyledEngineProvider>
      );
    } else if (!selectedOrganization) {
      // This allows is to reload open views that require an organization
      return (
        <StyledEngineProvider injectFirst>
          <CircularProgress className={classes.spinner} size='193' />;
        </StyledEngineProvider>
      );
    }
  }

  const organizationWithoutSB = () => {
    if (selectedOrganization) {
      return {
        ...selectedOrganization,
      };
    }
  };

  const selectedOrgHasSpecies = (): boolean => species.length > 0;

  const selectedOrgHasSeedBanks = (): boolean => {
    if (selectedOrganization && selectedOrganization.facilities) {
      return selectedOrganization.facilities.some((facility) => {
        return facility.type === 'Seed Bank';
      });
    } else {
      return false;
    }
  };

  const getSeedBanksView = (): JSX.Element => {
    if (selectedOrganization && selectedOrgHasSeedBanks()) {
      return <SeedBanks organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'SeedBanks'} />;
  };

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <ToastSnackbar />
      <>
        {showNavBar ? (
          <div className={type !== 'desktop' ? classes.navBarOpened : ''}>
            <div className='blurred'>
              {type !== 'desktop' ? (
                <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
                  <div>
                    <NavBar organization={selectedOrganization} setShowNavBar={setShowNavBar} />
                  </div>
                </Slide>
              ) : (
                <NavBar organization={selectedOrganization} setShowNavBar={setShowNavBar} />
              )}
            </div>
          </div>
        ) : null}
        <div
          className={`${type === 'desktop' && showNavBar ? classes.contentWithNavBar : ''} ${
            classes.content
          } scrollable-content`}
        >
          <TopBar>
            <TopBarContent
              notifications={notifications}
              setNotifications={setNotifications}
              organizations={organizations}
              selectedOrganization={selectedOrganization}
              setSelectedOrganization={setSelectedOrganization}
              reloadOrganizationData={reloadData}
              user={user}
              reloadUser={reloadUser}
              setShowNavBar={setShowNavBar}
            />
          </TopBar>
          <ErrorBoundary setShowNavBar={setShowNavBar}>
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
                <SeedSummary organization={selectedOrganization} />
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
                  organization={selectedOrganization}
                  searchCriteria={seedSearchCriteria}
                  setSearchCriteria={setSeedSearchCriteria}
                  searchSortOrder={seedSearchSort}
                  setSearchSortOrder={setSeedSearchSort}
                  searchColumns={seedSearchColumns}
                  setSearchColumns={setSeedSearchColumns}
                  displayColumnNames={accessionsDisplayColumns}
                  setDisplayColumnNames={setAccessionsDisplayColumns}
                  hasSeedBanks={selectedOrgHasSeedBanks()}
                />
              </Route>
              {!isProduction && (
                <Route exact path={APP_PATHS.ACCESSIONS2}>
                  <div>Accessions2 Database Coming Soon!</div>
                </Route>
              )}
              {!isProduction && (
                <Route path={APP_PATHS.ACCESSIONS2_ITEM}>
                  <Accession2View />
                </Route>
              )}
              {!isProduction && (
                <Route exact path={APP_PATHS.ACCESSIONS2_NEW}>
                  <div>Accessions2 Create Coming Soon!</div>
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.MONITORING}>
                  <Monitoring
                    organization={selectedOrganization}
                    hasSeedBanks={selectedOrgHasSeedBanks()}
                    reloadData={reloadData}
                  />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SEED_BANK_MONITORING}>
                  <Monitoring
                    organization={selectedOrganization}
                    hasSeedBanks={selectedOrgHasSeedBanks()}
                    reloadData={reloadData}
                  />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SPECIES}>
                  {selectedOrgHasSpecies() ? (
                    <SpeciesList organization={selectedOrganization} reloadData={reloadSpecies} species={species} />
                  ) : (
                    <EmptyStatePage
                      pageName={'Species'}
                      organization={selectedOrganization}
                      reloadData={reloadSpecies}
                    />
                  )}
                </Route>
              )}
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
                <People organization={selectedOrganization} reloadData={reloadData} user={user} />
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SEED_BANKS_NEW}>
                  <NewSeedBank organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SEED_BANKS_EDIT}>
                  <NewSeedBank organization={selectedOrganization} reloadOrganizationData={reloadData} />
                </Route>
              )}
              <Route path={APP_PATHS.SEED_BANKS_VIEW}>
                <SeedBankDetails organization={selectedOrganization} />
              </Route>
              {selectedOrganization && (
                <Route exact path={APP_PATHS.SEED_BANKS}>
                  {getSeedBanksView()}
                </Route>
              )}
              <Route exact path={APP_PATHS.CONTACT_US}>
                <ContactUs />
              </Route>
              {user && (
                <Route exact path={APP_PATHS.MY_ACCOUNT_EDIT}>
                  <MyAccount
                    user={user}
                    organizations={organizations}
                    edit={true}
                    reloadUser={reloadUser}
                    reloadData={reloadData}
                  />
                </Route>
              )}
              {user && (
                <Route exact path={APP_PATHS.MY_ACCOUNT}>
                  <MyAccount user={user} organizations={organizations} edit={false} reloadUser={reloadUser} />
                </Route>
              )}

              {/* Redirects. Invalid paths will redirect to the closest valid path. */}
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
              <Route path={APP_PATHS.SEEDS_DASHBOARD + '/'}>
                <Redirect to={APP_PATHS.SEEDS_DASHBOARD} />
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
    </StyledEngineProvider>
  );
}
