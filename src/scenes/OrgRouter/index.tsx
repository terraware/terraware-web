import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Box, Slide, useTheme } from '@mui/material';

import ErrorBoundary from 'src/ErrorBoundary';
import ProjectsRouter from 'src/components/Projects/Router';
import SeedFundReportsRouter from 'src/components/SeedFundReports/Router';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import ApplicationProvider from 'src/providers/Application';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import SpeciesProvider from 'src/providers/Species/SpeciesProvider';
import PlantingSiteProvider from 'src/providers/Tracking/PlantingSiteProvider';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import AccessionsRouter from 'src/scenes/AccessionsRouter';
import ApplicationRouter from 'src/scenes/ApplicationRouter';
import BatchBulkWithdrawView from 'src/scenes/BatchBulkWithdrawView';
import CheckIn from 'src/scenes/CheckIn';
import DeliverablesRouter from 'src/scenes/DeliverablesRouter';
import HelpSupportRouter from 'src/scenes/HelpSupportRouter';
import Home from 'src/scenes/Home';
import InventoryRouter from 'src/scenes/InventoryRouter';
import ModulesRouter from 'src/scenes/ModulesRouter';
import MyAccountRouter from 'src/scenes/MyAccountRouter';
import NurseriesRouter from 'src/scenes/NurseriesRouter';
import NurseryRouter from 'src/scenes/NurseryRouter';
import ObservationsRouter from 'src/scenes/ObservationsRouter';
import ObservationRouterV2 from 'src/scenes/ObservationsRouterV2';
import OptInFeaturesView from 'src/scenes/OptInFeatures';
import NavBar from 'src/scenes/OrgRouter/NavBar';
import OrganizationRouter from 'src/scenes/OrganizationRouter';
import PeopleRouter from 'src/scenes/PeopleRouter';
import PlantingSites from 'src/scenes/PlantingSitesRouter';
import PlantsDashboardRouter from 'src/scenes/PlantsDashboardRouter';
import AcceleratorReportsRouter from 'src/scenes/Reports';
import SeedBanksRouter from 'src/scenes/SeedBanksRouter';
import SeedsDashboard from 'src/scenes/SeedsDashboard';
import SpeciesRouter from 'src/scenes/Species';
import { Project } from 'src/types/Project';
import { getRgbaFromHex } from 'src/utils/color';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useEnvironment from 'src/utils/useEnvironment';
import useStateLocation from 'src/utils/useStateLocation';

import ActivityLogRouter from '../ActivityLogRouter';

interface OrgRouterProps {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const OrgRouter = ({ showNavBar, setShowNavBar }: OrgRouterProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { type } = useDeviceInfo();
  const { isProduction } = useEnvironment();
  const { reloadUserPreferences: reloadPreferences } = useUser();
  const location = useStateLocation();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();

  const newObservationViewEnabled = isEnabled('New Observation View');

  const { species } = useSpeciesData();
  const { plantingSites, observationResults } = useOrgTracking();
  const projects: Project[] | undefined = useAppSelector(selectProjects);

  const hasObservationsResults = useMemo(() => {
    return observationResults.length > 0;
  }, [observationResults.length]);

  const contentStyles = {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px !important',
    },
  };

  const contentWithNavBar = {
    '& > div, & > main': {
      paddingTop: '96px !important',
      paddingLeft: '220px !important',
    },
  };

  const navBarOpened = {
    backdropFilter: 'blur(8px)',
    background: getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.8),
    height: '100%',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 1300,
    inset: '0px',
  };

  const [withdrawalCreated, setWithdrawalCreated] = useState<boolean>(false);

  const reloadProjects = useCallback(() => {
    const populateProjects = () => {
      if (selectedOrganization && !isPlaceholderOrg(selectedOrganization.id)) {
        void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populateProjects();
  }, [selectedOrganization, dispatch, activeLocale]);

  const setDefaults = useCallback(() => {
    if (selectedOrganization && !isPlaceholderOrg(selectedOrganization.id)) {
      setWithdrawalCreated(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    reloadProjects();
  }, [reloadProjects]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  const selectedOrgHasSpecies = useCallback((): boolean => species.length > 0, [species]);

  const selectedOrgHasSeedBanks = useCallback(
    (): boolean => (selectedOrganization ? selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank') : false),
    [selectedOrganization]
  );

  const selectedOrgHasNurseries = useCallback(
    (): boolean => (selectedOrganization ? selectedOrgHasFacilityType(selectedOrganization, 'Nursery') : false),
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
          <Box sx={navBarOpened}>
            <NavBar
              setShowNavBar={setShowNavBar}
              withdrawalCreated={withdrawalCreated}
              hasPlantingSites={selectedOrgHasPlantingSites()}
            />
          </Box>
        </Slide>
      ) : (
        <NavBar
          setShowNavBar={setShowNavBar}
          backgroundTransparent={viewHasBackgroundImage()}
          withdrawalCreated={withdrawalCreated}
          hasPlantingSites={selectedOrgHasPlantingSites()}
        />
      )}
      <Box
        sx={type === 'desktop' || showNavBar ? { ...contentStyles, ...contentWithNavBar } : contentStyles}
        className='scrollable-content'
      >
        <ErrorBoundary setShowNavBar={setShowNavBar}>
          <Routes>
            {/* Routes, in order of their appearance down the side NavBar */}
            <Route path={APP_PATHS.HOME} element={<Home selectedOrgHasSpecies={selectedOrgHasSpecies} />} />
            <Route path={APP_PATHS.SEEDS_DASHBOARD} element={<SeedsDashboard />} />
            <Route path={APP_PATHS.CHECKIN} element={<CheckIn />} />
            <Route path={APP_PATHS.ACCESSIONS + '/*'} element={<AccessionsRouter />} />
            <Route path={APP_PATHS.SPECIES + '/*'} element={<SpeciesRouter />} />
            <Route path={APP_PATHS.ORGANIZATION + '/*'} element={<OrganizationRouter />} />
            <Route path={APP_PATHS.PEOPLE + '/*'} element={<PeopleRouter />} />
            {/* modules router *must* come before the projects router,
            or else the path will be picked up by the projects router */}
            <Route path={APP_PATHS.PROJECT_MODULES + '/*'} element={<ModulesRouter />} />
            <Route
              path={APP_PATHS.PROJECTS + '/*'}
              element={
                <ProjectsRouter
                  reloadProjects={reloadProjects}
                  isPlaceholderOrg={() => (selectedOrganization ? isPlaceholderOrg(selectedOrganization.id) : true)}
                  selectedOrgHasProjects={selectedOrgHasProjects}
                />
              }
            />
            <Route path={APP_PATHS.SEED_BANKS + '/*'} element={<SeedBanksRouter />} />
            <Route path={APP_PATHS.NURSERIES + '/*'} element={<NurseriesRouter />} />
            <Route path={APP_PATHS.PLANTS_DASHBOARD + '/*'} element={<PlantsDashboardRouter />} />
            <Route
              path={APP_PATHS.INVENTORY + '/*'}
              element={<InventoryRouter setWithdrawalCreated={setWithdrawalCreated} />}
            />
            <Route
              path={APP_PATHS.BATCH_WITHDRAW}
              element={<BatchBulkWithdrawView withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />}
            />
            <Route path={APP_PATHS.PLANTING_SITES + '/*'} element={<PlantingSites />} />
            <Route path={APP_PATHS.NURSERY + '/*'} element={<NurseryRouter />} />
            <Route path={APP_PATHS.HELP_SUPPORT + '/*'} element={<HelpSupportRouter />} />
            <Route path={APP_PATHS.MY_ACCOUNT + '/*'} element={<MyAccountRouter />} />
            <Route path={APP_PATHS.REPORTS + '/*'} element={<AcceleratorReportsRouter />} />
            <Route path={APP_PATHS.SEED_FUND_REPORTS + '/*'} element={<SeedFundReportsRouter />} />
            <Route
              path={APP_PATHS.OBSERVATIONS + '/*'}
              element={newObservationViewEnabled ? <ObservationRouterV2 /> : <ObservationsRouter />}
            />
            <Route path={APP_PATHS.DELIVERABLES + '/*'} element={<DeliverablesRouter />} />
            <Route path={APP_PATHS.APPLICATIONS + '/*'} element={<ApplicationRouter />} />
            <Route path={APP_PATHS.ACTIVITY_LOG + '/*'} element={<ActivityLogRouter />} />

            {!isProduction && (
              <Route path={APP_PATHS.OPT_IN} element={<OptInFeaturesView refresh={reloadPreferences} />} />
            )}

            <Route path='*' element={<Navigate to={APP_PATHS.HOME} />} />
          </Routes>
        </ErrorBoundary>
      </Box>
    </>
  );
};

const OrgRouterWithProviders = (props: OrgRouterProps) => {
  return (
    <SpeciesProvider>
      <ApplicationProvider>
        <ParticipantProvider>
          <PlantingSiteProvider>
            <OrgRouter {...props} />
          </PlantingSiteProvider>
        </ParticipantProvider>
      </ApplicationProvider>
    </SpeciesProvider>
  );
};

export default OrgRouterWithProviders;
