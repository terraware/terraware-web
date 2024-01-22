/* eslint-disable import/no-webpack-loader-syntax */
import { CssBaseline, Slide, StyledEngineProvider, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import useStateLocation from './utils/useStateLocation';
import ContactUs from 'src/components/ContactUs';
import Home from 'src/scenes/Home';
import NoOrgLandingPage from 'src/components/emptyStatePages/NoOrgLandingPage';
import NavBar from 'src/components/NavBar';
import CheckIn from 'src/scenes/CheckIn';
import SeedsDashboard from 'src/scenes/SeedsDashboard';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { selectHasObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import MyAccount from './components/MyAccount';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useEnvironment from 'src/utils/useEnvironment';
import OptInFeatures from './components/OptInFeatures';
import InventoryV2 from './components/InventoryV2';
import InventoryViewForSpecies from './components/InventoryV2/InventoryViewForSpecies';
import InventoryViewForNursery from './components/InventoryV2/InventoryViewForNursery';
import InventoryBatch from './components/InventoryV2/InventoryBatch';
import {
  BatchBulkWithdrawWrapperComponent,
  SpeciesBulkWithdrawWrapperComponent,
} from './components/Inventory/withdraw';
import { NurseryWithdrawals, NurseryWithdrawalsDetails, NurseryReassignment } from './components/NurseryWithdrawals';
import { PlantingSite } from 'src/types/Tracking';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import AppBootstrap from './AppBootstrap';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useAppVersion } from './hooks/useAppVersion';
import Observations from 'src/components/Observations';
import { getRgbaFromHex } from 'src/utils/color';
import PlantsDashboard from 'src/components/Plants';
import PlantingSites from 'src/components/PlantingSites';
import isEnabled from 'src/features';
import { Project } from './types/Project';
import { selectProjects } from './redux/features/projects/projectsSelectors';
import ProjectsRouter from 'src/components/Projects/Router';
import { requestProjects } from './redux/features/projects/projectsThunks';
import InventoryCreateView from './components/InventoryV2/InventoryCreateView';
import ReportsRouter from 'src/components/Reports/Router';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';
import MonitoringRouter from 'src/scenes/MonitoringRouter';
import SpeciesView from 'src/scenes/Species';
import OrganizationRouter from 'src/scenes/OrganizationRouter';
import AccessionsRouter from 'src/scenes/AccessionsRouter';
import PeopleRouter from 'src/scenes/PeopleRouter';
import SeedBanksRouter from 'src/scenes/SeedBanksRouter';
import NurseriesRouter from 'src/scenes/NurseriesRouter';

interface StyleProps {
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.TwClrBaseGray025,
    backgroundImage:
      'linear-gradient(180deg,' +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`,
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    '& .navbar': {
      backgroundColor: (props: StyleProps) =>
        props.isDesktop ? theme.palette.TwClrBaseGray025 : theme.palette.TwClrBaseWhite,
      backgroundImage: (props: StyleProps) =>
        props.isDesktop
          ? 'linear-gradient(180deg,' +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`
          : null,
      backgroundAttachment: 'fixed',
      paddingRight: (props: StyleProps) => (props.isDesktop ? '8px' : undefined),
      marginTop: (props: StyleProps) => (props.isDesktop ? '96px' : '0px'),
      paddingTop: (props: StyleProps) => (props.isDesktop ? '0px' : '24px'),
      overflowY: 'auto',
      width: (props: StyleProps) => (props.isDesktop ? '210px' : '300px'),
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
    backdropFilter: 'blur(8px)',
    background: getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.8),
    height: '100%',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 1300,
    inset: '0px',
  },
}));

const MINIMAL_USER_ROUTES: string[] = [
  APP_PATHS.WELCOME,
  APP_PATHS.MY_ACCOUNT,
  APP_PATHS.MY_ACCOUNT_EDIT,
  APP_PATHS.OPT_IN,
];

function AppContent() {
  // manager hooks
  useAppVersion();

  const { isDesktop, type } = useDeviceInfo();
  const classes = useStyles({ isDesktop });
  const location = useStateLocation();
  const { organizations, selectedOrganization, reloadOrganizations } = useOrganization();
  const [withdrawalCreated, setWithdrawalCreated] = useState<boolean>(false);
  const { isProduction } = useEnvironment();
  const { reloadUserPreferences: reloadPreferences } = useUser();

  const history = useHistory();
  const species = useAppSelector(selectSpecies);
  const hasObservationsResults: boolean = useAppSelector(selectHasObservationsResults);
  const plantingSites: PlantingSite[] | undefined = useAppSelector(selectPlantingSites);
  const projects: Project[] | undefined = useAppSelector(selectProjects);
  const [plantingSubzoneNames, setPlantingSubzoneNames] = useState<Record<number, string>>({});
  const [showNavBar, setShowNavBar] = useState(true);
  const featureFlagProjects = isEnabled('Projects');

  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();

  const setDefaults = useCallback(() => {
    if (!isPlaceholderOrg(selectedOrganization.id)) {
      setWithdrawalCreated(false);
    }
  }, [selectedOrganization.id]);

  const reloadSpecies = useCallback(() => {
    void dispatch(requestSpecies(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  const reloadTracking = useCallback(() => {
    const populatePlantingSites = () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        void dispatch(requestPlantingSites(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populatePlantingSites();
  }, [dispatch, selectedOrganization.id, activeLocale]);

  const reloadProjects = useCallback(() => {
    const populateProjects = () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populateProjects();
  }, [selectedOrganization.id, dispatch, activeLocale]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  useEffect(() => {
    reloadSpecies();
  }, [reloadSpecies]);

  useEffect(() => {
    reloadTracking();
  }, [reloadTracking]);

  useEffect(() => {
    reloadProjects();
  }, [reloadProjects]);

  useEffect(() => {
    const subzones: Record<number, string> = {};
    for (const plantingSite of plantingSites ?? []) {
      for (const plantingZone of plantingSite.plantingZones ?? []) {
        for (const subzone of plantingZone.plantingSubzones ?? []) {
          subzones[subzone.id] = subzone.name;
        }
      }
    }

    setPlantingSubzoneNames(subzones);
  }, [plantingSites]);

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

  const selectedOrgHasSpecies = (): boolean => (species || []).length > 0;

  const selectedOrgHasSeedBanks = (): boolean => selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank');

  const selectedOrgHasNurseries = (): boolean => selectedOrgHasFacilityType(selectedOrganization, 'Nursery');

  const selectedOrgHasProjects = (): boolean => projects !== undefined && projects.length > 0;

  const selectedOrgHasPlantingSites = (): boolean => plantingSites !== undefined && plantingSites.length > 0;

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
      (location.pathname.startsWith(APP_PATHS.OBSERVATIONS) && !hasObservationsResults) ||
      (location.pathname.startsWith(APP_PATHS.PLANTING_SITES) && !selectedOrgHasPlantingSites()) ||
      (location.pathname.startsWith(APP_PATHS.PROJECTS) && !selectedOrgHasProjects())
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
            <MyAccount organizations={organizations} edit={true} reloadData={reloadOrganizations} />
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
          <Route path='*'>
            <Redirect to={APP_PATHS.WELCOME} />
          </Route>
        </Switch>
      </>
    );
  };

  const getContent = () => (
    <>
      {type !== 'desktop' ? (
        <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
          <div className={classes.navBarOpened}>
            <NavBar
              setShowNavBar={setShowNavBar}
              withdrawalCreated={withdrawalCreated}
              hasPlantingSites={selectedOrgHasPlantingSites()}
            />
          </div>
        </Slide>
      ) : (
        <NavBar
          setShowNavBar={setShowNavBar}
          backgroundTransparent={viewHasBackgroundImage()}
          withdrawalCreated={withdrawalCreated}
          hasPlantingSites={selectedOrgHasPlantingSites()}
        />
      )}
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
              <SeedsDashboard />
            </Route>

            <Route exact path={APP_PATHS.CHECKIN}>
              <CheckIn />
            </Route>

            <Route path={APP_PATHS.ACCESSIONS}>
              <AccessionsRouter setWithdrawalCreated={setWithdrawalCreated} />
            </Route>

            <Route path={APP_PATHS.MONITORING}>
              <MonitoringRouter />
            </Route>

            <Route exact path={APP_PATHS.SPECIES}>
              <SpeciesView />
            </Route>

            <Route path={APP_PATHS.ORGANIZATION}>
              <OrganizationRouter />
            </Route>

            <Route path={APP_PATHS.PEOPLE}>
              <PeopleRouter />
            </Route>

            {featureFlagProjects && (
              <Route path={APP_PATHS.PROJECTS}>
                <ProjectsRouter
                  reloadProjects={reloadProjects}
                  isPlaceholderOrg={() => isPlaceholderOrg(selectedOrganization.id)}
                  selectedOrgHasProjects={selectedOrgHasProjects}
                />
              </Route>
            )}

            <Route path={APP_PATHS.SEED_BANKS}>
              <SeedBanksRouter />
            </Route>

            <Route exact path={APP_PATHS.NURSERIES}>
              <NurseriesRouter />
            </Route>

            <Route exact path={APP_PATHS.PLANTS_DASHBOARD}>
              <PlantsDashboard />
            </Route>
            <Route exact path={APP_PATHS.PLANTING_SITE_DASHBOARD}>
              <PlantsDashboard />
            </Route>
            <Route exact path={APP_PATHS.INVENTORY}>
              <InventoryV2 hasNurseries={selectedOrgHasNurseries()} hasSpecies={selectedOrgHasSpecies()} />
            </Route>
            <Route exact path={APP_PATHS.INVENTORY_NEW}>
              <InventoryCreateView />
            </Route>
            <Route path={APP_PATHS.INVENTORY_WITHDRAW}>
              <SpeciesBulkWithdrawWrapperComponent withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
            </Route>
            <Route path={APP_PATHS.INVENTORY_BATCH}>
              <InventoryBatch origin='Batches' species={species || []} />
            </Route>
            <Route path={APP_PATHS.INVENTORY_BATCH_FOR_NURSERY}>
              <InventoryBatch origin='Nursery' species={species || []} />
            </Route>
            <Route path={APP_PATHS.INVENTORY_BATCH_FOR_SPECIES}>
              <InventoryBatch origin='Species' species={species || []} />
            </Route>
            <Route path={APP_PATHS.INVENTORY_ITEM_FOR_NURSERY}>
              <InventoryViewForNursery />
            </Route>
            <Route path={APP_PATHS.INVENTORY_ITEM_FOR_SPECIES}>
              <InventoryViewForSpecies species={species || []} />
            </Route>
            <Route path={APP_PATHS.BATCH_WITHDRAW}>
              <BatchBulkWithdrawWrapperComponent withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
            </Route>
            <Route path={APP_PATHS.PLANTING_SITES}>
              <PlantingSites reloadTracking={reloadTracking} />
            </Route>
            <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS}>
              <NurseryWithdrawals reloadTracking={reloadTracking} />
            </Route>
            <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS}>
              <NurseryWithdrawalsDetails species={species || []} plantingSubzoneNames={plantingSubzoneNames} />
            </Route>
            <Route exact path={APP_PATHS.NURSERY_REASSIGNMENT}>
              <NurseryReassignment />
            </Route>
            <Route exact path={APP_PATHS.CONTACT_US}>
              <ContactUs />
            </Route>
            <Route exact path={APP_PATHS.MY_ACCOUNT_EDIT}>
              <MyAccount organizations={organizations} edit={true} reloadData={reloadOrganizations} />
            </Route>
            <Route exact path={APP_PATHS.MY_ACCOUNT}>
              <MyAccount organizations={organizations} edit={false} />
            </Route>

            <Route path={APP_PATHS.REPORTS}>
              <ReportsRouter />
            </Route>

            <Route path={APP_PATHS.OBSERVATIONS}>
              <Observations />
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
            {featureFlagProjects && (
              <Route exact path={APP_PATHS.PROJECTS + '/'}>
                <Redirect to={APP_PATHS.PROJECTS} />
              </Route>
            )}
            <Route path={APP_PATHS.SEEDS_DASHBOARD + '/'}>
              <Redirect to={APP_PATHS.SEEDS_DASHBOARD} />
            </Route>
            <Route path={APP_PATHS.SPECIES + '/'}>
              <Redirect to={APP_PATHS.SPECIES} />
            </Route>
            <Route path='*'>
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
    <Provider store={store}>
      <AppBootstrap>
        <AppContent />
      </AppBootstrap>
    </Provider>
  );
}
