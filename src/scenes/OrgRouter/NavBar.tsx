import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
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
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import { requestOrganizationFeatures } from 'src/redux/features/organizations/organizationsAsyncThunks';
import { listOrganizationFeatures } from 'src/redux/features/organizations/organizationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import { isAdmin, isContributor, isManagerOrHigher } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type NavBarProps = {
  backgroundTransparent?: boolean;
  hasPlantingSites?: boolean;
  setShowNavBar: (value: boolean) => void;
  withdrawalCreated?: boolean;
};

export default function NavBar({
  backgroundTransparent,
  hasPlantingSites,
  setShowNavBar,
  withdrawalCreated,
}: NavBarProps): JSX.Element | null {
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [showNurseryWithdrawals, setShowNurseryWithdrawals] = useState<boolean>(false);
  const { isDesktop, isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const mixpanel = useMixpanel();

  const [orgFeaturesRequestId, setOrgFeaturesRequestId] = useState<string>('');
  const orgFeatures = useAppSelector(listOrganizationFeatures(orgFeaturesRequestId));

  const { isAllowedViewConsole } = useAcceleratorConsole();
  const { activeLocale } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject, projectsWithModules, allParticipantProjects } =
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
  const isOrganizationRoute = useMatch({ path: APP_PATHS.ORGANIZATION + '/', end: false });
  const isSeedBanksRoute = useMatch({ path: APP_PATHS.SEED_BANKS + '/', end: false });
  const isNurseriesRoute = useMatch({ path: APP_PATHS.NURSERIES + '/', end: false });
  const isInventoryRoute = useMatch({ path: APP_PATHS.INVENTORY + '/', end: false });
  const isBatchWithdrawRoute = useMatch({ path: APP_PATHS.BATCH_WITHDRAW + '/', end: false });
  const isPlantingSitesRoute = useMatch({ path: APP_PATHS.PLANTING_SITES + '/', end: false });
  const isPlantsDashboardRoute = useMatch({ path: APP_PATHS.PLANTS_DASHBOARD + '/', end: false });
  const isWithdrawalLogRoute = useMatch({ path: APP_PATHS.NURSERY_WITHDRAWALS + '/', end: false });
  const isReassignmentRoute = useMatch({ path: APP_PATHS.NURSERY_REASSIGNMENT + '/', end: false });
  const isReportsRoute = useMatch({ path: APP_PATHS.REPORTS + '/', end: false });
  const isSeedFundReportsRoute = useMatch({ path: APP_PATHS.SEED_FUND_REPORTS + '/', end: false });
  const isObservationsRoute = useMatch({ path: APP_PATHS.OBSERVATIONS + '/', end: false });
  const isProjectsRoute = useMatch({ path: APP_PATHS.PROJECTS + '/', end: true });
  const isProjectRoute = useMatch({ path: APP_PATHS.PROJECT_VIEW + '/', end: true });
  const isProjectModulesRoute = useMatch({ path: APP_PATHS.PROJECT_MODULES + '/', end: false });
  const isActivityLogRoute = useMatch({ path: APP_PATHS.ACTIVITY_LOG + '/', end: false });

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

  const checkNurseryWithdrawals = useCallback(() => {
    if (selectedOrganization) {
      void NurseryWithdrawalService.hasNurseryWithdrawals(selectedOrganization.id).then((result: boolean) => {
        setShowNurseryWithdrawals(result);
      });
    }
  }, [selectedOrganization]);

  useEffect(() => {
    setShowNurseryWithdrawals(false);
    if (selectedOrganization) {
      checkNurseryWithdrawals();
    }
  }, [selectedOrganization, checkNurseryWithdrawals]);

  useEffect(() => {
    if (withdrawalCreated && !showNurseryWithdrawals) {
      checkNurseryWithdrawals();
    }
  }, [withdrawalCreated, checkNurseryWithdrawals, showNurseryWithdrawals]);

  useEffect(() => {
    if (selectedOrganization && !isContributor(selectedOrganization)) {
      const request = dispatch(requestOrganizationFeatures({ organizationId: selectedOrganization.id }));
      setOrgFeaturesRequestId(request.requestId);
    }
  }, [dispatch, selectedOrganization]);

  useEffect(() => {
    if (!currentParticipantProject && projectsWithModules && projectsWithModules.length > 0) {
      setCurrentParticipantProject(projectsWithModules[0].id);
    }
  }, [projectsWithModules, currentParticipantProject, setCurrentParticipantProject]);

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

    return showNurseryWithdrawals ? [inventoryMenu, withdrawalLogMenu] : [inventoryMenu];
  };

  const deliverablesMenu = useMemo<JSX.Element | null>(
    () =>
      !!orgFeatures?.data?.deliverables?.enabled && activeLocale ? (
        <NavItem
          label={strings.DELIVERABLES}
          icon='iconSubmit'
          selected={!!isDeliverablesRoute}
          onClick={() => {
            mixpanel?.track(MIXPANEL_EVENTS.PART_EX_LEFT_NAV_DELIVERABLES);
            closeAndNavigateTo(isDeliverablesRoute && !isDeliverableViewRoute ? '' : APP_PATHS.DELIVERABLES);
          }}
          id='deliverables'
        />
      ) : null,
    [
      orgFeatures?.data?.deliverables?.enabled,
      activeLocale,
      isDeliverablesRoute,
      mixpanel,
      closeAndNavigateTo,
      isDeliverableViewRoute,
    ]
  );

  const reportsMenu = useMemo<JSX.Element | null>(
    () =>
      isAllowed('READ_REPORTS', { organization: selectedOrganization }) &&
      !!orgFeatures?.data?.reports?.enabled &&
      allParticipantProjects.length > 0 &&
      activeLocale ? (
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
      activeLocale,
      allParticipantProjects.length,
      closeAndNavigateTo,
      isAllowed,
      isReportsRoute,
      orgFeatures?.data?.reports?.enabled,
      selectedOrganization,
    ]
  );

  const seedFundReportsMenu = useMemo<JSX.Element | null>(
    () =>
      selectedOrganization?.canSubmitReports && activeLocale ? (
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
    [activeLocale, closeAndNavigateTo, isSeedFundReportsRoute, selectedOrganization?.canSubmitReports]
  );

  const modulesMenu = useMemo<JSX.Element | null>(
    () =>
      currentParticipantProject &&
      !!orgFeatures?.data?.modules?.enabled &&
      isManagerOrHigher(selectedOrganization) &&
      activeLocale ? (
        <NavItem
          icon='iconModule'
          label={strings.MODULES}
          selected={!!isProjectModulesRoute}
          onClick={() => {
            mixpanel?.track(MIXPANEL_EVENTS.PART_EX_LEFT_NAV_MODULES);
            closeAndNavigateTo(
              APP_PATHS.PROJECT_MODULES.replace(':projectId', currentParticipantProject.id.toString())
            );
          }}
          id='modules-list'
        />
      ) : null,
    [
      activeLocale,
      closeAndNavigateTo,
      currentParticipantProject,
      isProjectModulesRoute,
      mixpanel,
      orgFeatures?.data?.modules?.enabled,
      selectedOrganization,
    ]
  );

  const activityLogMenu = useMemo<JSX.Element | null>(
    () =>
      isAllowed('READ_ACTIVITIES', { organization: selectedOrganization }) &&
      currentParticipantProject &&
      activeLocale ? (
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
    [activeLocale, closeAndNavigateTo, currentParticipantProject, isActivityLogRoute, isAllowed, selectedOrganization]
  );

  const applicationMenu = useMemo<JSX.Element | null>(
    () =>
      !!orgFeatures?.data?.applications?.enabled && activeLocale ? (
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
      activeLocale,
      closeAndNavigateTo,
      isApplicationRoute,
      orgFeatures?.data?.applications?.enabled,
      theme.palette.TwClrIcnSecondary,
      theme.palette.TwClrTxt,
    ]
  );

  const acceleratorSectionTitle = useMemo<string>(
    () => (deliverablesMenu || modulesMenu ? strings.ACCELERATOR.toUpperCase() : ''),
    [deliverablesMenu, modulesMenu]
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
          onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_OVERVIEW)}
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
      <NavItem label={strings.PLANTS} icon='iconRestorationSite' id='plants'>
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
            <NavItem
              label={strings.OBSERVATIONS}
              selected={!!isObservationsRoute}
              onClick={() => {
                closeAndNavigateTo(APP_PATHS.OBSERVATIONS);
              }}
              id='observations'
            />
          ) : (
            <></>
          )}
        </SubNavbar>
      </NavItem>

      <NavSection title={strings.SETTINGS.toUpperCase()} />
      {isAdmin(selectedOrganization) && (
        <NavItem
          label={strings.ORGANIZATION}
          icon='organizationNav'
          selected={!!isOrganizationRoute}
          onClick={() => {
            closeAndNavigateTo(isOrganizationRoute ? '' : APP_PATHS.ORGANIZATION);
          }}
          id='organization'
        />
      )}
      <NavItem
        label={strings.PEOPLE}
        icon='peopleNav'
        selected={!!isPeopleRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.PEOPLE);
        }}
        id='people'
      />
      {isAdmin(selectedOrganization) && (
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
