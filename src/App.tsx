/* eslint-disable import/no-webpack-loader-syntax */
import { CssBaseline, Slide, StyledEngineProvider, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import hexRgb from 'hex-rgb';
import useStateLocation from './utils/useStateLocation';
import { DEFAULT_SEED_SEARCH_FILTERS, DEFAULT_SEED_SEARCH_SORT_ORDER } from 'src/api/seeds/search';
import { SearchSortOrder, SearchCriteria } from 'src/api/search';
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
import isEnabled from 'src/features';
import useSnackbar from 'src/utils/useSnackbar';
import { TimeZoneDescription, InitializedTimeZone } from 'src/types/TimeZones';
import { useLocalization, useOrganization, useTimeZones, useUser } from 'src/providers';
import { OrganizationService, PreferencesService, UserService } from 'src/services';
import { Link } from 'react-router-dom';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';
import { defaultSelectedOrg } from 'src/providers/contexts';
import strings from 'src/strings';
import AppBootstrap from './AppBootstrap';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useAppVersion } from './hooks/useAppVersion';
import { InitializedUnits, weightSystemsNames } from 'src/units';

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
      marginTop: (props: StyleProps) => (props.isDesktop ? '96px' : '8px'),
      paddingTop: 0,
      overflowY: 'auto',
      width: (props: StyleProps) => (props.isDesktop ? '210px' : undefined),
      zIndex: 1000,
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.TwClrBgGhostActive,
      },
      '& .nav-footer': {
        marginBottom: (props: StyleProps) => (props.isDesktop ? '128px' : '32px'),
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
      paddingLeft: '220px',
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

const MINIMAL_USER_ROUTES: string[] = [
  APP_PATHS.WELCOME,
  APP_PATHS.MY_ACCOUNT,
  APP_PATHS.MY_ACCOUNT_EDIT,
  APP_PATHS.OPT_IN,
];

const isPlaceholderOrg = (id: number) => id === defaultSelectedOrg.id;

function AppContent() {
  // manager hooks
  useAppVersion();

  const { isDesktop, type } = useDeviceInfo();
  const classes = useStyles({ isDesktop });
  const location = useStateLocation();
  const {
    organizations,
    selectedOrganization,
    reloadData,
    reloadPreferences,
    orgPreferences,
    orgPreferenceForId,
    userPreferences,
  } = useOrganization();
  const [withdrawalCreated, setWithdrawalCreated] = useState<boolean>(false);
  const { isProduction } = useEnvironment();
  const { user, reloadUser } = useUser();
  const snackbar = useSnackbar();
  const timeZones = useTimeZones();
  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const weightUnitsEnabled = isEnabled('Weight units');
  const preferredWeightSystem = weightUnitsEnabled ? (userPreferences.preferredWeightSystem as string) : '';

  // seedSearchCriteria describes which criteria to apply when searching accession data.
  const [seedSearchCriteria, setSeedSearchCriteria] = useState<SearchCriteria>(DEFAULT_SEED_SEARCH_FILTERS);

  // seedSearchSort describes which sort criterion to apply when searching accession data.
  const [seedSearchSort, setSeedSearchSort] = useState<SearchSortOrder>(DEFAULT_SEED_SEARCH_SORT_ORDER);

  // seedSearchColumns describes which accession columns to request when searching accession data.
  const [seedSearchColumns, setSeedSearchColumns] = useState<string[]>(DefaultColumns(preferredWeightSystem).fields);

  /*
   * accessionsDisplayColumns describes which columns are displayed in the accessions list, and in which order.
   * Differs from seedSearchSelectedColumns because the order matters. Also, sometimes the two lists won't have
   * exactly the same columns. E.g. if the user adds the Withdrawal -> "Seeds Withdrawn" column,
   * then seedSearchSelectedColumns will contain withdrawalQuantity and withdrawalUnits but this list will only
   * contain withdrawalQuantity.
   */
  const [accessionsDisplayColumns, setAccessionsDisplayColumns] = useState<string[]>(
    DefaultColumns(preferredWeightSystem).fields
  );

  const history = useHistory();
  const [species, setSpecies] = useState<Species[]>([]);
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const [plotNames, setPlotNames] = useState<Record<number, string>>({});
  const [showNavBar, setShowNavBar] = useState(true);
  const [showUnitSnackbar, setShowUnitSnackbar] = useState(false);

  const reloadSpecies = useCallback(() => {
    const populateSpecies = async () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
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
      if (!isPlaceholderOrg(selectedOrganization.id)) {
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

  const setDefaults = useCallback(() => {
    if (!isPlaceholderOrg(selectedOrganization.id)) {
      setAccessionsDisplayColumns(DefaultColumns(preferredWeightSystem).fields);
      setWithdrawalCreated(false);
    }
  }, [selectedOrganization.id, preferredWeightSystem]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  useEffect(() => {
    if (organizations?.length === 0 && MINIMAL_USER_ROUTES.indexOf(location.pathname) === -1) {
      history.push(APP_PATHS.WELCOME);
    }
  }, [organizations, location, history]);

  useEffect(() => {
    if (type === 'mobile' || type === 'tablet') {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [type]);

  useEffect(() => {
    if (showUnitSnackbar) {
      snackbar.pageInfo(
        strings.formatString<any>(
          strings.UNITS_INITIALIZED_MESSAGE,
          weightSystemsNames().find((ws) => ws.value === userPreferences.preferredWeightSystem ?? 'metric')?.label,
          <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
        ),
        strings.UNITS_INITIALIZED_TITLE,

        {
          label: strings.GOT_IT,
          apply: () => {
            PreferencesService.updateUserPreferences({ unitsAcknowledgedOnMs: Date.now() });
          },
        },
        'user'
      );
    }
  }, [showUnitSnackbar, snackbar, userPreferences.preferredWeightSystem]);

  useEffect(() => {
    const initializeWeightUnits = async () => {
      if (!user || !userPreferences) {
        return;
      }

      const userUnit: InitializedUnits = await UserService.initializeUnits('metric');
      if (!userUnit.units) {
        return;
      }

      if (userUnit.updated) {
        reloadPreferences();
      }

      if (!userUnit.unitsAcknowledgedOnMs) {
        setShowUnitSnackbar(true);
      }
    };

    if (weightUnitsEnabled) {
      initializeWeightUnits();
    }
  }, [user, userPreferences, snackbar, weightUnitsEnabled, reloadPreferences]);

  useEffect(() => {
    const getDefaultTimeZone = (): TimeZoneDescription => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return getTimeZone(timeZones, browserTimeZone) || getUTC(timeZones);
    };

    const notifyTimeZoneUpdates = async (userTz: InitializedTimeZone, orgTz: InitializedTimeZone) => {
      const notifyUser = userTz.timeZone && !userTz.timeZoneAcknowledgedOnMs;
      const notifyOrg = orgTz.timeZone && !orgTz.timeZoneAcknowledgedOnMs;
      if (!notifyUser && !notifyOrg) {
        snackbar.pageInfo('', undefined, undefined, 'org');
        return;
      }

      let message: string | string[] = '';

      if (notifyUser && notifyOrg) {
        message = strings.formatString<any>(
          strings.TIME_ZONE_INITIALIZED_USER_ORG_MESSAGE,
          getTimeZone(timeZones, userTz.timeZone)?.longName,
          <Link to={APP_PATHS.ORGANIZATION}>{strings.ORGANIZATION}</Link>,
          <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
        );
      } else if (notifyUser) {
        message = strings.formatString<any>(
          strings.TIME_ZONE_INITIALIZED_USER_MESSAGE,
          getTimeZone(timeZones, userTz.timeZone)?.longName,
          <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
        );
      } else if (notifyOrg) {
        message = strings.formatString<any>(
          strings.TIME_ZONE_INITIALIZED_ORG_MESSAGE,
          getTimeZone(timeZones, orgTz.timeZone)?.longName,
          <Link to={APP_PATHS.ORGANIZATION}>{strings.ORGANIZATION}</Link>
        );
      }

      snackbar.pageInfo(
        message,
        strings.TIME_ZONE_INITIALIZED_TITLE,
        {
          label: strings.GOT_IT,
          apply: () => {
            if (notifyUser) {
              PreferencesService.updateUserPreferences({ timeZoneAcknowledgedOnMs: Date.now() });
            }
            if (notifyOrg) {
              PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
                timeZoneAcknowledgedOnMs: Date.now(),
              });
            }
          },
        },
        'org'
      );
    };

    const initializeTimeZones = async () => {
      if (!user) {
        return;
      }

      const userTz: InitializedTimeZone = await UserService.initializeTimeZone(user, getDefaultTimeZone().id);
      if (!userTz.timeZone) {
        return;
      }

      let orgTz: InitializedTimeZone = {};
      if (!isPlaceholderOrg(selectedOrganization.id) && orgPreferenceForId === selectedOrganization.id) {
        orgTz = await OrganizationService.initializeTimeZone(selectedOrganization, userTz.timeZone);
      }

      if (userTz.updated) {
        reloadUser();
      }

      if (orgTz.updated) {
        reloadData();
      }

      if (!userTz.updated && !orgTz.updated) {
        notifyTimeZoneUpdates(userTz, orgTz);
      }
    };

    if (timeZoneFeatureEnabled && !isPlaceholderOrg(selectedOrganization.id)) {
      initializeTimeZones();
    }
  }, [
    reloadData,
    reloadUser,
    selectedOrganization,
    snackbar,
    timeZoneFeatureEnabled,
    timeZones,
    user,
    orgPreferenceForId,
  ]);

  const selectedOrgHasSpecies = (): boolean => species.length > 0;

  const selectedOrgHasFacilityType = (facilityType: FacilityType): boolean => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrganization.facilities) {
      return selectedOrganization.facilities.some((facility: any) => {
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
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasSeedBanks()) {
      return <SeedBanks organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'SeedBanks'} />;
  };

  const getNurseriesView = (): JSX.Element => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasNurseries()) {
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

  const getOrphanedUserContent = () => {
    return (
      <>
        <Switch>
          <Route exact path={APP_PATHS.MY_ACCOUNT_EDIT}>
            <MyAccount organizations={organizations} edit={true} reloadData={reloadData} />
          </Route>
          <Route exact path={APP_PATHS.MY_ACCOUNT}>
            <MyAccount organizations={organizations} edit={false} />
          </Route>
          <Route exact path={APP_PATHS.WELCOME}>
            <NoOrgLandingPage />
          </Route>
          {!isProduction && (
            <Route exact path={APP_PATHS.OPT_IN}>
              <OptInFeatures refresh={reloadPreferences} />
            </Route>
          )}
          <Route path='/'>
            <Redirect to={APP_PATHS.WELCOME} />
          </Route>
        </Switch>
      </>
    );
  };

  const getContent = () => (
    <>
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
                orgScopedPreferences={orgPreferences}
              />
            </Route>
            <Route exact path={APP_PATHS.ACCESSIONS2_NEW}>
              <Accession2Create />
            </Route>
            <Route path={APP_PATHS.ACCESSIONS2_ITEM}>
              <Accession2View />
            </Route>
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
              <EditOrganization organization={selectedOrganization} reloadOrganizationData={reloadData} />
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
              <People />
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
            <Route exact path={APP_PATHS.MY_ACCOUNT_EDIT}>
              <MyAccount organizations={organizations} edit={true} reloadData={reloadData} />
            </Route>
            <Route exact path={APP_PATHS.MY_ACCOUNT}>
              <MyAccount organizations={organizations} edit={false} />
            </Route>

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
    </>
  );

  // Localized strings are stored outside of React's state, but there's a state change when they're
  // updated. Declare the dependency here so the app rerenders when the locale changes.
  useLocalization();

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <ToastSnackbar />
      <TopBar>
        <TopBarContent setShowNavBar={setShowNavBar} />
      </TopBar>
      <div className={classes.container}>{organizations.length === 0 ? getOrphanedUserContent() : getContent()}</div>
    </StyledEngineProvider>
  );
}

export default function App(): JSX.Element {
  return (
    <AppBootstrap>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </AppBootstrap>
  );
}
