import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useMatch } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import SubNavbar from '@terraware/web-components/components/Navbar/SubNavbar';

import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import Navbar from 'src/components/common/Navbar/Navbar';
import NewBadge from 'src/components/common/NewBadge';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useOrganizationFeatures from 'src/hooks/useOrganizationFeatures';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyCountNurseryWithdrawalsQuery } from 'src/queries/search/nurseries';
import { isAdmin, isManagerOrHigher } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type NavBarProps = {
  backgroundTransparent?: boolean;
  hasPlantingSites?: boolean;
  setShowNavBar: (value: boolean) => void;
};

export default function NavBar({
  backgroundTransparent,
  hasPlantingSites,
  setShowNavBar,
}: NavBarProps): JSX.Element | null {
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isDesktop, isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const trackEvent = useTrackEvent();

  const orgFeatures = useOrganizationFeatures();

  const { isAllowedViewConsole } = useAcceleratorConsole();
  const { strings } = useLocalization();
  const { currentAcceleratorProject, setCurrentAcceleratorProject, projectsWithModules, allAcceleratorProjects } =
    useParticipantData();

  const isAccessionDashboardRoute = useMatch({ path: APP_PATHS.SEEDS_DASHBOARD + '/', end: false });
  const isAccessionsRoute = useMatch({ path: APP_PATHS.ACCESSIONS + '/', end: false });
  const isApplicationRoute = useMatch({ path: APP_PATHS.APPLICATIONS + '/', end: false });
  const isCheckInRoute = useMatch({ path: APP_PATHS.CHECKIN + '/', end: false });
  const isDeliverablesRoute = useMatch({ path: APP_PATHS.DELIVERABLES + '/', end: false });
  const isDeliverableViewRoute = useMatch({ path: APP_PATHS.DELIVERABLE_VIEW + '/', end: false });
  const isHomeRoute = useMatch({ path: APP_PATHS.HOME + '/', end: false });
  const isPeopleRoute = useMatch({ path: APP_PATHS.PEOPLE + '/', end: false });
  const isSpeciesRoute = useMatch({ path: APP_PATHS.SPECIES + '/', end: false });
  const isSeedBanksRoute = useMatch({ path: APP_PATHS.SEED_BANKS + '/', end: false });
  const isNurseriesRoute = useMatch({ path: APP_PATHS.NURSERIES + '/', end: false });
  const isInventoryRoute = useMatch({ path: APP_PATHS.INVENTORY + '/', end: false });
  const isInventoryPlanningRoute = useMatch({ path: APP_PATHS.INVENTORY_PLANNING + '/', end: false });
  const isBatchWithdrawRoute = useMatch({ path: APP_PATHS.BATCH_WITHDRAW + '/', end: false });
  const isPlantingSitesRoute = useMatch({ path: APP_PATHS.PLANTING_SITES + '/', end: false });
  const isPlantsDashboardRoute = useMatch({ path: APP_PATHS.PLANTS_DASHBOARD + '/', end: false });
  const isPlantingProgressRoute = useMatch({ path: APP_PATHS.PLANTING_PROGRESS + '/', end: false });
  const isPlantingSeasonsRoute = useMatch({ path: APP_PATHS.PLANTING_SEASONS + '/', end: false });
  const isWithdrawalLogRoute = useMatch({ path: APP_PATHS.NURSERY_WITHDRAWALS + '/', end: false });
  const isReassignmentRoute = useMatch({ path: APP_PATHS.NURSERY_REASSIGNMENT + '/', end: false });
  const isReportsRoute = useMatch({ path: APP_PATHS.REPORTS + '/', end: false });
  const isSeedFundReportsRoute = useMatch({ path: APP_PATHS.SEED_FUND_REPORTS + '/', end: false });
  const isObservationsRoute = useMatch({ path: APP_PATHS.OBSERVATIONS + '/', end: false });
  const isProjectsRoute = useMatch({ path: APP_PATHS.PROJECTS + '/', end: true });
  const isProjectRoute = useMatch({ path: APP_PATHS.PROJECT_VIEW + '/', end: true });
  const isProjectModulesRoute = useMatch({ path: APP_PATHS.PROJECT_MODULES + '/', end: false });
  const isActivityLogRoute = useMatch({ path: APP_PATHS.ACTIVITY_LOG + '/', end: false });

  const isPlantingSeasonsEnabled = isEnabled('Planting Seasons');

  const closeNavBar = useCallback(() => {
    if (!isDesktop) {
      setShowNavBar(false);
    }
  }, [isDesktop, setShowNavBar]);

  const closeAndNavigateTo = useCallback(
    (path: string) => {
      closeNavBar();
      if (path) {
        navigate(path);
      }
    },
    [closeNavBar, navigate]
  );

  const [countNurseryWithdrawals, countNurseryWithdrawalsResponse] = useLazyCountNurseryWithdrawalsQuery();
  const showNurseryWithdrawals = useMemo(
    () => !!countNurseryWithdrawalsResponse?.currentData,
    [countNurseryWithdrawalsResponse?.currentData]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void countNurseryWithdrawals({ organizationId: selectedOrganization.id }, true);
    }
  }, [countNurseryWithdrawals, selectedOrganization]);

  const [listPlantingSeasonsForNav, plantingSeasonsForNavResponse] = useLazyListPlantingSeasonsQuery();
  const hasPlantingSeasonWithTargets = useMemo(
    () => (plantingSeasonsForNavResponse?.currentData?.seasons ?? []).some((s) => s.speciesTargets.length > 0),
    [plantingSeasonsForNavResponse?.currentData]
  );

  useEffect(() => {
    if (isPlantingSeasonsEnabled && selectedOrganization) {
      void listPlantingSeasonsForNav({ organizationId: selectedOrganization.id }, true);
    }
  }, [isPlantingSeasonsEnabled, listPlantingSeasonsForNav, selectedOrganization]);

  useEffect(() => {
    if (!currentAcceleratorProject && projectsWithModules && projectsWithModules.length > 0) {
      setCurrentAcceleratorProject(projectsWithModules[0].id);
    }
  }, [projectsWithModules, currentAcceleratorProject, setCurrentAcceleratorProject]);

  const getSeedlingsMenuItems = () => {
    const inventoryMenu = (
      <NavItem
        label={strings.INVENTORY}
        selected={!!isInventoryRoute || !!isBatchWithdrawRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.INVENTORY);
        }}
        id='inventory'
        key='inventory'
      />
    );

    const inventoryPlanningMenu = (
      <NavItem
        label={strings.INVENTORY_PLANNING}
        selected={!!isInventoryPlanningRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.INVENTORY_PLANNING);
        }}
        id='inventoryplanning'
        key='inventoryplanning'
      />
    );

    const withdrawalLogMenu = (
      <NavItem
        label={strings.WITHDRAWALS}
        selected={!!isWithdrawalLogRoute || !!isReassignmentRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.NURSERY_WITHDRAWALS);
        }}
        id='withdrawallog'
        key='withdrawallog'
      />
    );

    const items = [inventoryMenu];
    if (isPlantingSeasonsEnabled && hasPlantingSeasonWithTargets) {
      items.push(inventoryPlanningMenu);
    }
    if (showNurseryWithdrawals) {
      items.push(withdrawalLogMenu);
    }
    return items;
  };

  const deliverablesMenu = useMemo<JSX.Element | null>(
    () =>
      orgFeatures?.deliverables?.enabled ? (
        <NavItem
          label={strings.DELIVERABLES}
          icon='iconSubmit'
          selected={!!isDeliverablesRoute}
          onClick={() => {
            trackEvent(MIXPANEL_EVENTS.PARTICIPANT_DELIVERABLES_NAV_CLICKED);
            closeAndNavigateTo(isDeliverablesRoute && !isDeliverableViewRoute ? '' : APP_PATHS.DELIVERABLES);
          }}
          id='deliverables'
        />
      ) : null,
    [
      orgFeatures?.deliverables?.enabled,
      strings.DELIVERABLES,
      isDeliverablesRoute,
      trackEvent,
      closeAndNavigateTo,
      isDeliverableViewRoute,
    ]
  );

  const reportsMenu = useMemo<JSX.Element | null>(
    () =>
      isAllowed('READ_REPORTS', { organization: selectedOrganization }) &&
      !!orgFeatures?.reports?.enabled &&
      allAcceleratorProjects.length > 0 ? (
        <NavItem
          icon='iconGraphReport'
          label={strings.REPORTS}
          selected={!!isReportsRoute}
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.REPORTS);
          }}
          id='reports-list'
        />
      ) : null,
    [
      allAcceleratorProjects.length,
      closeAndNavigateTo,
      isAllowed,
      isReportsRoute,
      orgFeatures,
      selectedOrganization,
      strings.REPORTS,
    ]
  );

  const seedFundReportsMenu = useMemo<JSX.Element | null>(
    () =>
      selectedOrganization?.canSubmitReports && isAdmin(selectedOrganization) ? (
        <NavItem
          icon='iconGraphReport'
          label={strings.SEED_FUND_REPORTS}
          selected={!!isSeedFundReportsRoute}
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.SEED_FUND_REPORTS);
          }}
          id='seed-fund-reports-list'
        />
      ) : null,
    [closeAndNavigateTo, isSeedFundReportsRoute, selectedOrganization, strings.SEED_FUND_REPORTS]
  );

  const modulesMenu = useMemo<JSX.Element | null>(
    () =>
      currentAcceleratorProject && !!orgFeatures?.modules?.enabled && isManagerOrHigher(selectedOrganization) ? (
        <NavItem
          icon='iconModule'
          label={strings.MODULES}
          selected={!!isProjectModulesRoute}
          onClick={() => {
            trackEvent(MIXPANEL_EVENTS.PARTICIPANT_MODULES_NAV_CLICKED);
            closeAndNavigateTo(
              APP_PATHS.PROJECT_MODULES.replace(':projectId', currentAcceleratorProject.id.toString())
            );
          }}
          id='modules-list'
        />
      ) : null,
    [
      closeAndNavigateTo,
      currentAcceleratorProject,
      isProjectModulesRoute,
      trackEvent,
      orgFeatures,
      selectedOrganization,
      strings.MODULES,
    ]
  );

  const activityLogMenu = useMemo<JSX.Element | null>(
    () =>
      isAllowed('READ_ACTIVITIES', { organization: selectedOrganization }) && currentAcceleratorProject ? (
        <NavItem
          icon='checklist'
          id='activity-log'
          label={strings.ACTIVITY_LOG}
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.ACTIVITY_LOG);
          }}
          selected={!!isActivityLogRoute}
        />
      ) : null,
    [
      closeAndNavigateTo,
      currentAcceleratorProject,
      isActivityLogRoute,
      isAllowed,
      selectedOrganization,
      strings.ACTIVITY_LOG,
    ]
  );

  const applicationMenu = useMemo<JSX.Element | null>(
    () =>
      orgFeatures?.applications?.enabled ? (
        <NavItem
          label={
            <Box
              display='flex'
              alignItems={'center'}
              padding={'11px 0px'}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <Icon name='iconFile' className='nav-item--icon' fillColor={theme.palette.TwClrIcnSecondary} />
              <Typography fontSize={'14px'} fontWeight={500} color={theme.palette.TwClrTxt} lineHeight={'normal'}>
                {strings.APPLICATION}
              </Typography>
              <Box marginLeft={'8px'}>
                <NewBadge />
              </Box>
            </Box>
          }
          selected={!!isApplicationRoute}
          onClick={() => closeAndNavigateTo(APP_PATHS.APPLICATIONS)}
          id='applications-list'
        />
      ) : null,
    [
      closeAndNavigateTo,
      isApplicationRoute,
      orgFeatures,
      strings.APPLICATION,
      theme.palette.TwClrIcnSecondary,
      theme.palette.TwClrTxt,
    ]
  );

  const acceleratorSectionTitle = useMemo<string>(
    () => (deliverablesMenu || modulesMenu ? strings.ACCELERATOR.toUpperCase() : ''),
    [deliverablesMenu, modulesMenu, strings.ACCELERATOR]
  );

  return (
    <Navbar
      setShowNavBar={setShowNavBar as React.Dispatch<React.SetStateAction<boolean>>}
      backgroundTransparent={backgroundTransparent}
    >
      {isMobile && isAllowedViewConsole && (
        <NavItem
          label={strings.ACCELERATOR_CONSOLE}
          icon='home'
          onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_PROJECTS)}
          id='console'
        />
      )}
      <NavItem
        label={strings.HOME}
        icon='home'
        selected={!!isHomeRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.HOME);
        }}
        id='home'
      />
      <NavItem
        label={strings.SPECIES}
        icon='species'
        selected={!!isSpeciesRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.SPECIES);
        }}
        id='speciesNb'
      />
      {(applicationMenu ||
        deliverablesMenu ||
        modulesMenu ||
        activityLogMenu ||
        reportsMenu ||
        seedFundReportsMenu) && (
        <>
          <NavSection title={acceleratorSectionTitle} />
          {applicationMenu}
          {deliverablesMenu}
          {modulesMenu}
          {activityLogMenu}
          {reportsMenu}
          {seedFundReportsMenu}
        </>
      )}
      <NavSection />
      <NavItem label={strings.SEEDS} icon='seeds' id='seeds'>
        <SubNavbar>
          <NavItem
            label={strings.DASHBOARD}
            selected={!!isAccessionDashboardRoute}
            onClick={() => {
              closeAndNavigateTo(isAccessionDashboardRoute ? '' : APP_PATHS.SEEDS_DASHBOARD);
            }}
            id='seeds-dashboard'
          />
          <NavItem
            label={strings.ACCESSIONS}
            selected={isAccessionsRoute || isCheckInRoute ? true : false}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.ACCESSIONS);
            }}
            id='accessions'
          />
        </SubNavbar>
      </NavItem>
      <NavItem label={strings.SEEDLINGS} icon='iconSeedling' id='seedlings'>
        <SubNavbar>{getSeedlingsMenuItems()}</SubNavbar>
      </NavItem>
      <NavItem label={strings.PLANTINGS} icon='iconRestorationSite' id='plants'>
        <SubNavbar>
          <NavItem
            label={strings.DASHBOARD}
            selected={!!isPlantsDashboardRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.PLANTS_DASHBOARD);
            }}
            id='plants-dashboard'
          />

          {hasPlantingSites === true ? (
            <>
              {isPlantingSeasonsEnabled && (
                <NavItem
                  label={strings.PLANTING_SEASONS}
                  selected={!!isPlantingSeasonsRoute}
                  onClick={() => {
                    closeAndNavigateTo(APP_PATHS.PLANTING_SEASONS);
                  }}
                  id='planting-seasons'
                />
              )}
              <NavItem
                label={strings.PLANTING_PROGRESS}
                selected={!!isPlantingProgressRoute}
                onClick={() => {
                  closeAndNavigateTo(APP_PATHS.PLANTING_PROGRESS);
                }}
                id='planting-progress'
              />
              <NavItem
                label={strings.OBSERVATIONS}
                selected={!!isObservationsRoute}
                onClick={() => {
                  closeAndNavigateTo(APP_PATHS.OBSERVATIONS);
                }}
                id='observations'
              />
            </>
          ) : (
            <></>
          )}
        </SubNavbar>
      </NavItem>

      <NavSection title={strings.SETTINGS.toUpperCase()} />
      <NavItem
        label={strings.PEOPLE}
        icon='peopleNav'
        selected={!!isPeopleRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.PEOPLE);
        }}
        id='people'
      />
      {isManagerOrHigher(selectedOrganization) && (
        <>
          <NavItem
            label={strings.PROJECTS}
            icon='iconFolder'
            selected={!!(isProjectsRoute || isProjectRoute)}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.PROJECTS);
            }}
            id='projects'
          />
          <NavItem label={strings.LOCATIONS} icon='iconMyLocation' id='locations'>
            <SubNavbar>
              <NavItem
                label={strings.SEED_BANKS}
                selected={!!isSeedBanksRoute}
                onClick={() => {
                  closeAndNavigateTo(APP_PATHS.SEED_BANKS);
                }}
                id='seedbanks'
              />
              <NavItem
                label={strings.NURSERIES}
                selected={!!isNurseriesRoute}
                onClick={() => {
                  closeAndNavigateTo(APP_PATHS.NURSERIES);
                }}
                id='nurseries'
              />
              <NavItem
                label={strings.PLANTING_SITES}
                selected={!!isPlantingSitesRoute}
                onClick={() => {
                  closeAndNavigateTo(APP_PATHS.PLANTING_SITES);
                }}
                id='plantingSites'
              />
            </SubNavbar>
          </NavItem>
        </>
      )}

      <NavFooter>
        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
