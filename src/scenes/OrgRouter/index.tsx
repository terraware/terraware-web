import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Slide, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import ErrorBoundary from 'src/ErrorBoundary';
import ProjectsRouter from 'src/components/Projects/Router';
import ReportsRouter from 'src/components/Reports/Router';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { selectHasObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import AccessionsRouter from 'src/scenes/AccessionsRouter';
import BatchBulkWithdrawView from 'src/scenes/BatchBulkWithdrawView';
import CheckIn from 'src/scenes/CheckIn';
import ContactUsView from 'src/scenes/ContactUs';
import DeliverablesRouter from 'src/scenes/DeliverablesRouter';
import Home from 'src/scenes/Home';
import InventoryRouter from 'src/scenes/InventoryRouter';
import MonitoringRouter from 'src/scenes/MonitoringRouter';
import MyAccountRouter from 'src/scenes/MyAccountRouter';
import NurseriesRouter from 'src/scenes/NurseriesRouter';
import NurseryRouter from 'src/scenes/NurseryRouter';
import ObservationsRouter from 'src/scenes/ObservationsRouter';
import OptInFeaturesView from 'src/scenes/OptInFeatures';
import NavBar from 'src/scenes/OrgRouter/NavBar';
import OrganizationRouter from 'src/scenes/OrganizationRouter';
import PeopleRouter from 'src/scenes/PeopleRouter';
import PlantingSites from 'src/scenes/PlantingSitesRouter';
import PlantsDashboardRouter from 'src/scenes/PlantsDashboardRouter';
import RedirectsRouter from 'src/scenes/RedirectsRouter';
import SeedBanksRouter from 'src/scenes/SeedBanksRouter';
import SeedsDashboard from 'src/scenes/SeedsDashboard';
import SpeciesRouter from 'src/scenes/Species';
import { Project } from 'src/types/Project';
import { PlantingSite } from 'src/types/Tracking';
import { getRgbaFromHex } from 'src/utils/color';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useEnvironment from 'src/utils/useEnvironment';
import useStateLocation from 'src/utils/useStateLocation';

interface OrgRouterProps {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
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

const OrgRouter = ({ showNavBar, setShowNavBar }: OrgRouterProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { type } = useDeviceInfo();
  const { isProduction } = useEnvironment();
  const { reloadUserPreferences: reloadPreferences } = useUser();
  const location = useStateLocation();
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();

  const species = useAppSelector(selectSpecies);
  const hasObservationsResults: boolean = useAppSelector(selectHasObservationsResults);
  const plantingSites: PlantingSite[] | undefined = useAppSelector(selectPlantingSites);
  const projects: Project[] | undefined = useAppSelector(selectProjects);

  const [withdrawalCreated, setWithdrawalCreated] = useState<boolean>(false);

  const reloadSpecies = useCallback(() => {
    void dispatch(requestSpecies(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  const reloadProjects = useCallback(() => {
    const populateProjects = () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populateProjects();
  }, [selectedOrganization.id, dispatch, activeLocale]);

  const reloadPlantingSites = useCallback(() => {
    const populatePlantingSites = () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        void dispatch(requestPlantingSites(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populatePlantingSites();
  }, [dispatch, selectedOrganization.id, activeLocale]);

  const setDefaults = useCallback(() => {
    if (!isPlaceholderOrg(selectedOrganization.id)) {
      setWithdrawalCreated(false);
    }
  }, [selectedOrganization.id]);

  useEffect(() => {
    reloadSpecies();
  }, [reloadSpecies]);

  useEffect(() => {
    reloadProjects();
  }, [reloadProjects]);

  useEffect(() => {
    reloadPlantingSites();
  }, [reloadPlantingSites]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  const selectedOrgHasSpecies = useCallback((): boolean => (species || []).length > 0, [species]);

  const selectedOrgHasSeedBanks = useCallback(
    (): boolean => selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank'),
    [selectedOrganization]
  );

  const selectedOrgHasNurseries = useCallback(
    (): boolean => selectedOrgHasFacilityType(selectedOrganization, 'Nursery'),
    [selectedOrganization]
  );

  const selectedOrgHasProjects = useCallback((): boolean => projects !== undefined && projects.length > 0, [projects]);

  const selectedOrgHasPlantingSites = useCallback(
    (): boolean => plantingSites !== undefined && plantingSites.length > 0,
    [plantingSites]
  );

  const viewHasBackgroundImage = useCallback((): boolean => {
    return (
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
    );
  }, [
    hasObservationsResults,
    location.pathname,
    selectedOrgHasNurseries,
    selectedOrgHasPlantingSites,
    selectedOrgHasProjects,
    selectedOrgHasSeedBanks,
    selectedOrgHasSpecies,
  ]);

  return (
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

            <Route path={APP_PATHS.SPECIES}>
              <SpeciesRouter />
            </Route>

            <Route path={APP_PATHS.ORGANIZATION}>
              <OrganizationRouter />
            </Route>

            <Route path={APP_PATHS.PEOPLE}>
              <PeopleRouter />
            </Route>

            <Route path={APP_PATHS.PROJECTS}>
              <ProjectsRouter
                reloadProjects={reloadProjects}
                isPlaceholderOrg={() => isPlaceholderOrg(selectedOrganization.id)}
                selectedOrgHasProjects={selectedOrgHasProjects}
              />
            </Route>

            <Route path={APP_PATHS.SEED_BANKS}>
              <SeedBanksRouter />
            </Route>

            <Route path={APP_PATHS.NURSERIES}>
              <NurseriesRouter />
            </Route>

            <Route path={APP_PATHS.PLANTS_DASHBOARD}>
              <PlantsDashboardRouter />
            </Route>

            <Route path={APP_PATHS.INVENTORY}>
              <InventoryRouter setWithdrawalCreated={setWithdrawalCreated} />
            </Route>

            <Route path={APP_PATHS.BATCH_WITHDRAW}>
              <BatchBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
            </Route>

            <Route path={APP_PATHS.PLANTING_SITES}>
              <PlantingSites reloadTracking={reloadPlantingSites} />
            </Route>

            <Route path={'/nursery'}>
              <NurseryRouter />
            </Route>

            <Route exact path={APP_PATHS.CONTACT_US}>
              <ContactUsView />
            </Route>

            <Route path={APP_PATHS.MY_ACCOUNT}>
              <MyAccountRouter />
            </Route>

            <Route path={APP_PATHS.REPORTS}>
              <ReportsRouter />
            </Route>

            <Route path={APP_PATHS.OBSERVATIONS}>
              <ObservationsRouter />
            </Route>

            <Route path={APP_PATHS.DELIVERABLES}>
              <DeliverablesRouter />
            </Route>

            {!isProduction && (
              <Route exact path={APP_PATHS.OPT_IN}>
                <OptInFeaturesView refresh={reloadPreferences} />
              </Route>
            )}

            <RedirectsRouter />
          </Switch>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default OrgRouter;
