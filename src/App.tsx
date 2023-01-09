/* eslint-disable import/no-webpack-loader-syntax */
import { CircularProgress, CssBaseline, Slide, StyledEngineProvider, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import hexRgb from 'hex-rgb';
import useQuery from './utils/useQuery';
import useStateLocation, { getLocation } from './utils/useStateLocation';
import { getOrganizations } from 'src/api/organization/organization';
import { DEFAULT_SEED_SEARCH_FILTERS, DEFAULT_SEED_SEARCH_SORT_ORDER } from 'src/api/seeds/search';
import { SearchSortOrder, SearchCriteria } from 'src/api/search';
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
import CheckIn from 'src/components/seeds/checkin';
import Database from 'src/components/seeds/database';
import { defaultPreset as DefaultColumns } from 'src/components/seeds/database/columns';
import SeedSummary from 'src/components/seeds/summary';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import { FacilityType } from 'src/api/types/facilities';
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
import { Accession2Create, Accession2View } from './components/accession2';
import OptInFeatures from './components/OptInFeatures';
import Nurseries from './components/Nurseries';
import NewNursery from './components/NewNursery';
import Inventory from './components/Inventory';
import NurseryDetails from './components/Nursery';
import InventoryCreate from './components/Inventory/InventoryCreate';
import InventoryView from './components/Inventory/InventoryView';
import { CreatePlantingSite, PlantingSitesList } from './components/PlantingSites';
import PlantingSiteView from './components/PlantingSites/PlantingSiteView';
import {
  BatchBulkWithdrawWrapperComponent,
  SpeciesBulkWithdrawWrapperComponent,
} from './components/Inventory/withdraw';
import PlantsDashboard from './components/Plants';
import { NurseryWithdrawals, NurseryWithdrawalsDetails, NurseryReassignment } from './components/NurseryWithdrawals';
import { listPlantingSites } from './api/tracking/tracking';
import { PlantingSite } from './api/types/tracking';
import { LocalizationProvider, OrganizationProvider, TimeZoneDescription, UserProvider } from './providers';
import { defaultSelectedOrg } from './providers/contexts';
import { getTimeZones } from './api/timezones/timezones';

interface StyleProps {
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.TwClrBaseGray025,
    backgroundImage:
      'linear-gradient(180deg,' +
      `${hexRgb(`${theme.palette.TwClrBaseGreen050}`, { alpha: 0, format: 'css' })} 0%,` +
      `${hexRgb(`${theme.palette.TwClrBaseGreen050}`, { alpha: 0.4, format: 'css' })} 100%)`,
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    '& .navbar': {
      backgroundColor: theme.palette.TwClrBaseGray025,
      backgroundImage:
        'linear-gradient(180deg,' +
        `${hexRgb(`${theme.palette.TwClrBaseGreen050}`, { alpha: 0, format: 'css' })} 0%,` +
        `${hexRgb(`${theme.palette.TwClrBaseGreen050}`, { alpha: 0.4, format: 'css' })} 100%)`,
      backgroundAttachment: 'fixed',
      paddingRight: (props: StyleProps) => (props.isDesktop ? '8px' : undefined),
      paddingTop: (props: StyleProps) => (props.isDesktop ? '96px' : '8px'),
      overflowY: 'auto',
      width: (props: StyleProps) => (props.isDesktop ? '180px' : undefined),
      zIndex: 1000,
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.TwClrBgGhostActive,
      },
    },
  },
  content: {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px',
    },
  },
  contentWithNavBar: {
    '& > div, & > main': {
      paddingLeft: '190px',
    },
  },
  navBarOpened: {
    '& .blurred': {
      backdropFilter: 'blur(8px)',
      background: hexRgb(`${theme.palette.TwClrBgSecondary}`, { alpha: 0.8, format: 'css' }),
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
      color: theme.palette.TwClrIcnBrand,
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
  const { isDesktop, type } = useDeviceInfo();
  const classes = useStyles({ isDesktop });
  const query = useQuery();
  const location = useStateLocation();
  const [selectedOrganization, setSelectedOrganization] = useState<ServerOrganization>();
  const [preferencesOrg, setPreferencesOrg] = useState<{ [key: string]: unknown }>();
  const [orgScopedPreferences, setOrgScopedPreferences] = useState<{ [key: string]: unknown }>();
  const [withdrawalCreated, setWithdrawalCreated] = useState<boolean>(false);
  const { isProduction } = useEnvironment();

  // seedSearchCriteria describes which criteria to apply when searching accession data.
  const [seedSearchCriteria, setSeedSearchCriteria] = useState<SearchCriteria>(DEFAULT_SEED_SEARCH_FILTERS);

  // seedSearchSort describes which sort criterion to apply when searching accession data.
  const [seedSearchSort, setSeedSearchSort] = useState<SearchSortOrder>(DEFAULT_SEED_SEARCH_SORT_ORDER);

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
  const [species, setSpecies] = useState<Species[]>([]);
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const [plotNames, setPlotNames] = useState<Record<number, string>>({});
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

  const reloadTracking = useCallback(() => {
    const populatePlantingSites = async () => {
      if (selectedOrganization) {
        const response = await listPlantingSites(selectedOrganization.id, true);
        if (response.requestSucceeded) {
          setPlantingSites(response.sites || []);
        }
      }
    };
    populatePlantingSites();
  }, [selectedOrganization]);

  useEffect(() => {
    reloadTracking();
  }, [reloadTracking]);

  useEffect(() => {
    const plots: Record<number, string> = {};
    for (const plantingSite of plantingSites) {
      for (const plantingZone of plantingSite.plantingZones ?? []) {
        for (const plot of plantingZone.plots ?? []) {
          plots[plot.id] = plot.name;
        }
      }
    }

    setPlotNames(plots);
  }, [plantingSites]);

  const reloadPreferences = useCallback(() => {
    const getUserPreferences = async () => {
      const response = await getPreferences();
      if (organizations && response.requestSucceeded) {
        setPreferencesOrg(response.preferences);
      }
    };
    getUserPreferences();
  }, [organizations, setPreferencesOrg]);

  const reloadOrgPreferences = useCallback(() => {
    const getOrgPreferences = async () => {
      if (selectedOrganization) {
        const response = await getPreferences(selectedOrganization.id);
        if (response.requestSucceeded) {
          setOrgScopedPreferences(response.preferences);
        }
      }
    };
    // reset display columns so we don't spill them across orgs
    setAccessionsDisplayColumns(DefaultColumns.fields);
    getOrgPreferences();
    setWithdrawalCreated(false);
  }, [selectedOrganization]);

  useEffect(() => {
    reloadPreferences();
  }, [reloadPreferences]);

  useEffect(() => {
    reloadOrgPreferences();
  }, [reloadOrgPreferences, selectedOrganization]);

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

  const [locale] = useState('en');
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);

  useEffect(() => {
    const fetchTimeZones = async () => {
      const timeZoneResponse = await getTimeZones(locale);
      if (!timeZoneResponse.error && timeZoneResponse.timeZones) {
        setTimeZones(timeZoneResponse.timeZones);
      }
    };

    fetchTimeZones();
  }, [locale]);

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
          <UserProvider data={{ user, reloadUser }}>
            <OrganizationProvider
              data={{
                selectedOrganization: defaultSelectedOrg,
                setSelectedOrganization,
                organizations,
                reloadData,
              }}
            >
              <LocalizationProvider data={{ supportedTimeZones: timeZones }}>
                <TopBar fullWidth={true}>
                  <TopBarContent setShowNavBar={setShowNavBar} />
                </TopBar>
                <ToastSnackbar />
                <NoOrgLandingPage />
              </LocalizationProvider>
            </OrganizationProvider>
          </UserProvider>
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

  const selectedOrgHasSpecies = (): boolean => species.length > 0;

  const selectedOrgHasFacilityType = (facilityType: FacilityType): boolean => {
    if (selectedOrganization && selectedOrganization.facilities) {
      return selectedOrganization.facilities.some((facility) => {
        return facility.type === facilityType;
      });
    } else {
      return false;
    }
  };

  const selectedOrgHasSeedBanks = (): boolean => selectedOrgHasFacilityType('Seed Bank');

  const selectedOrgHasNurseries = (): boolean => selectedOrgHasFacilityType('Nursery');

  const selectedOrgHasPlantingSites = (): boolean => plantingSites.length > 0;

  const getSeedBanksView = (): JSX.Element => {
    if (selectedOrganization && selectedOrgHasSeedBanks()) {
      return <SeedBanks organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'SeedBanks'} />;
  };

  const getNurseriesView = (): JSX.Element => {
    if (selectedOrganization && selectedOrgHasNurseries()) {
      return <Nurseries organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'Nurseries'} />;
  };

  const viewHasBackgroundImage = (): boolean => {
    if (
      location.pathname.startsWith(APP_PATHS.HOME) ||
      (location.pathname.startsWith(APP_PATHS.SPECIES) && !selectedOrgHasSpecies()) ||
      (location.pathname.startsWith(APP_PATHS.ACCESSIONS) &&
        (!selectedOrgHasSeedBanks() || !selectedOrgHasSpecies())) ||
      (location.pathname.startsWith(APP_PATHS.MONITORING) && !selectedOrgHasSeedBanks()) ||
      (location.pathname.startsWith(APP_PATHS.INVENTORY) && (!selectedOrgHasNurseries() || !selectedOrgHasSpecies())) ||
      (location.pathname.startsWith(APP_PATHS.SEED_BANKS) && !selectedOrgHasSeedBanks()) ||
      (location.pathname.startsWith(APP_PATHS.NURSERIES) && !selectedOrgHasNurseries()) ||
      (location.pathname.startsWith(APP_PATHS.PLANTING_SITES) && !selectedOrgHasPlantingSites())
    ) {
      return true;
    }

    return false;
  };

  const getContent = () => (
    <>
      <ToastSnackbar />
      <TopBar>
        <TopBarContent setShowNavBar={setShowNavBar} />
      </TopBar>
      <div className={classes.container}>
        {showNavBar ? (
          <div className={type !== 'desktop' ? classes.navBarOpened : ''}>
            <div className='blurred'>
              {type !== 'desktop' ? (
                <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
                  <div>
                    <NavBar setShowNavBar={setShowNavBar} withdrawalCreated={withdrawalCreated} />
                  </div>
                </Slide>
              ) : (
                <NavBar
                  setShowNavBar={setShowNavBar}
                  backgroundTransparent={viewHasBackgroundImage()}
                  withdrawalCreated={withdrawalCreated}
                />
              )}
            </div>
          </div>
        ) : null}
        <div
          className={`${type === 'desktop' && showNavBar ? classes.contentWithNavBar : ''} ${
            classes.content
          } scrollable-content`}
        >
          <ErrorBoundary setShowNavBar={setShowNavBar}>
            <Switch>
              {/* Routes, in order of their appearance down the side NavBar */}
              <Route exact path={APP_PATHS.HOME}>
                <Home />
              </Route>
              <Route exact path={APP_PATHS.SEEDS_DASHBOARD}>
                <SeedSummary />
              </Route>
              <Route exact path={APP_PATHS.CHECKIN}>
                <CheckIn />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS}>
                <Database
                  searchCriteria={seedSearchCriteria}
                  setSearchCriteria={setSeedSearchCriteria}
                  searchSortOrder={seedSearchSort}
                  setSearchSortOrder={setSeedSearchSort}
                  searchColumns={seedSearchColumns}
                  setSearchColumns={setSeedSearchColumns}
                  displayColumnNames={accessionsDisplayColumns}
                  setDisplayColumnNames={setAccessionsDisplayColumns}
                  hasSeedBanks={selectedOrgHasSeedBanks()}
                  hasSpecies={selectedOrgHasSpecies()}
                  reloadData={reloadData}
                  orgScopedPreferences={orgScopedPreferences}
                />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS2_NEW}>
                <Accession2Create />
              </Route>
              {user && (
                <Route path={APP_PATHS.ACCESSIONS2_ITEM}>
                  <Accession2View />
                </Route>
              )}
              <Route exact path={APP_PATHS.MONITORING}>
                <Monitoring hasSeedBanks={selectedOrgHasSeedBanks()} reloadData={reloadData} />
              </Route>
              <Route exact path={APP_PATHS.SEED_BANK_MONITORING}>
                <Monitoring hasSeedBanks={selectedOrgHasSeedBanks()} reloadData={reloadData} />
              </Route>
              <Route exact path={APP_PATHS.SPECIES}>
                {selectedOrgHasSpecies() ? (
                  <SpeciesList reloadData={reloadSpecies} species={species} />
                ) : (
                  <EmptyStatePage pageName={'Species'} reloadData={reloadSpecies} />
                )}
              </Route>
              <Route exact path={APP_PATHS.ORGANIZATION_EDIT}>
                <EditOrganization
                  organization={selectedOrganization || defaultSelectedOrg}
                  reloadOrganizationData={reloadData}
                />
              </Route>
              <Route exact path={APP_PATHS.ORGANIZATION}>
                <Organization />
              </Route>
              <Route exact path={APP_PATHS.PEOPLE_NEW}>
                <NewPerson />
              </Route>
              <Route exact path={APP_PATHS.PEOPLE_EDIT}>
                <NewPerson />
              </Route>
              <Route path={APP_PATHS.PEOPLE_VIEW}>
                <PersonDetails />
              </Route>
              <Route exact path={APP_PATHS.PEOPLE}>
                <People reloadData={reloadData} />
              </Route>
              <Route exact path={APP_PATHS.SEED_BANKS_NEW}>
                <NewSeedBank />
              </Route>
              <Route exact path={APP_PATHS.SEED_BANKS_EDIT}>
                <NewSeedBank />
              </Route>
              <Route path={APP_PATHS.SEED_BANKS_VIEW}>
                <SeedBankDetails />
              </Route>
              <Route exact path={APP_PATHS.SEED_BANKS}>
                {getSeedBanksView()}
              </Route>
              <Route exact path={APP_PATHS.NURSERIES_NEW}>
                <NewNursery />
              </Route>
              <Route exact path={APP_PATHS.NURSERIES_EDIT}>
                <NewNursery />
              </Route>
              <Route exact path={APP_PATHS.PLANTS_DASHBOARD}>
                <PlantsDashboard />
              </Route>
              <Route exact path={APP_PATHS.PLANTING_SITE_DASHBOARD}>
                <PlantsDashboard />
              </Route>
              <Route path={APP_PATHS.NURSERIES_VIEW}>
                <NurseryDetails />
              </Route>
              <Route exact path={APP_PATHS.NURSERIES}>
                {getNurseriesView()}
              </Route>
              <Route exact path={APP_PATHS.INVENTORY}>
                <Inventory hasNurseries={selectedOrgHasNurseries()} hasSpecies={selectedOrgHasSpecies()} />
              </Route>
              <Route exact path={APP_PATHS.INVENTORY_NEW}>
                <InventoryCreate />
              </Route>
              <Route path={APP_PATHS.INVENTORY_WITHDRAW}>
                <SpeciesBulkWithdrawWrapperComponent withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
              </Route>
              <Route path={APP_PATHS.INVENTORY_ITEM}>
                <InventoryView species={species} />
              </Route>
              <Route path={APP_PATHS.BATCH_WITHDRAW}>
                <BatchBulkWithdrawWrapperComponent withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
              </Route>
              <Route exact path={APP_PATHS.PLANTING_SITES_NEW}>
                <CreatePlantingSite reloadPlantingSites={reloadTracking} />
              </Route>
              <Route exact path={APP_PATHS.PLANTING_SITES_EDIT}>
                <CreatePlantingSite reloadPlantingSites={reloadTracking} />
              </Route>
              <Route exact path={APP_PATHS.PLANTING_SITES}>
                <PlantingSitesList />
              </Route>
              <Route path={APP_PATHS.PLANTING_SITES_VIEW}>
                <PlantingSiteView />
              </Route>
              <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS}>
                <NurseryWithdrawals />
              </Route>
              <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS}>
                <NurseryWithdrawalsDetails species={species} plotNames={plotNames} />
              </Route>
              <Route exact path={APP_PATHS.NURSERY_REASSIGNMENT}>
                <NurseryReassignment />
              </Route>
              <Route exact path={APP_PATHS.CONTACT_US}>
                <ContactUs />
              </Route>
              {user && (
                <Route exact path={APP_PATHS.MY_ACCOUNT_EDIT}>
                  <MyAccount organizations={organizations} edit={true} reloadData={reloadData} />
                </Route>
              )}
              {user && (
                <Route exact path={APP_PATHS.MY_ACCOUNT}>
                  <MyAccount organizations={organizations} edit={false} />
                </Route>
              )}

              {!isProduction && (
                <Route exact path={APP_PATHS.OPT_IN}>
                  <OptInFeatures refresh={reloadPreferences} />
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
      </div>
    </>
  );

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <UserProvider data={{ user, reloadUser }}>
        {selectedOrganization && (
          <OrganizationProvider data={{ selectedOrganization, setSelectedOrganization, organizations, reloadData }}>
            <LocalizationProvider data={{ supportedTimeZones: timeZones }}>{getContent()}</LocalizationProvider>
          </OrganizationProvider>
        )}
      </UserProvider>
    </StyledEngineProvider>
  );
}
