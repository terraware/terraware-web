import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import SubNavbar from '@terraware/web-components/components/Navbar/SubNavbar';

import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import Navbar from 'src/components/common/Navbar/Navbar';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useModules } from 'src/hooks/useModules';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { NurseryWithdrawalService } from 'src/services';
import DeliverablesService from 'src/services/DeliverablesService';
import ReportService, { Reports } from 'src/services/ReportService';
import strings from 'src/strings';
import { isAdmin, isManagerOrHigher } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type NavBarProps = {
  backgroundTransparent?: boolean;
  hasPlantingSites?: boolean;
  setShowNavBar: (value: boolean) => void;
  withdrawalCreated?: boolean;
};
export default function NavBar({
  setShowNavBar,
  backgroundTransparent,
  withdrawalCreated,
  hasPlantingSites,
}: NavBarProps): JSX.Element | null {
  const { selectedOrganization } = useOrganization();
  const [showNurseryWithdrawals, setShowNurseryWithdrawals] = useState<boolean>(false);
  const [reports, setReports] = useState<Reports>([]);
  const [moduleProjectId, setModuleProjectId] = useState<number | undefined>(undefined);
  const [hasDeliverables, setHasDeliverables] = useState<boolean>(false);
  const { isDesktop, isMobile } = useDeviceInfo();
  const navigate = useNavigate();

  const { isAllowedViewConsole } = useAcceleratorConsole();
  const { activeLocale } = useLocalization();
  const { projectModules } = useModules();

  const initialized = useRef(false);

  const isAccessionDashboardRoute = useMatch(APP_PATHS.SEEDS_DASHBOARD + '/');
  const isAccessionsRoute = useMatch(APP_PATHS.ACCESSIONS + '/');
  const isCheckinRoute = useMatch(APP_PATHS.CHECKIN + '/');
  const isContactUsRoute = useMatch(APP_PATHS.CONTACT_US + '/');
  const isDeliverablesRoute = useMatch(APP_PATHS.DELIVERABLES + '/');
  const isDeliverableViewRoute = useMatch(APP_PATHS.DELIVERABLE_VIEW + '/');
  const isHomeRoute = useMatch(APP_PATHS.HOME + '/');
  const isPeopleRoute = useMatch(APP_PATHS.PEOPLE + '/');
  const isSpeciesRoute = useMatch(APP_PATHS.SPECIES + '/');
  const isOrganizationRoute = useMatch(APP_PATHS.ORGANIZATION + '/');
  const isMonitoringRoute = useMatch(APP_PATHS.MONITORING + '/');
  const isSeedbanksRoute = useMatch(APP_PATHS.SEED_BANKS + '/');
  const isNurseriesRoute = useMatch(APP_PATHS.NURSERIES + '/');
  const isInventoryRoute = useMatch(APP_PATHS.INVENTORY + '/');
  const isBatchWithdrawRoute = useMatch(APP_PATHS.BATCH_WITHDRAW + '/');
  const isPlantingSitesRoute = useMatch(APP_PATHS.PLANTING_SITES + '/');
  const isPlantsDashboardRoute = useMatch(APP_PATHS.PLANTS_DASHBOARD + '/');
  const isWithdrawalLogRoute = useMatch(APP_PATHS.NURSERY_WITHDRAWALS + '/');
  const isReassignmentRoute = useMatch(APP_PATHS.NURSERY_REASSIGNMENT + '/');
  const isReportsRoute = useMatch(APP_PATHS.REPORTS + '/');
  const isObservationsRoute = useMatch(APP_PATHS.OBSERVATIONS + '/');
  const isProjectsRoute = useMatch(APP_PATHS.PROJECTS + '/');
  const isProjectModulesRoute = useMatch(APP_PATHS.PROJECT_MODULES + '/');

  const featureFlagParticipantExperience = isEnabled('Participant Experience');

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
    NurseryWithdrawalService.hasNurseryWithdrawals(selectedOrganization.id).then((result: boolean) => {
      setShowNurseryWithdrawals(result);
    });
  }, [selectedOrganization.id]);

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
    const reportSearch = async () => {
      const reportsResults = await ReportService.getReports(selectedOrganization.id);
      setReports(reportsResults.reports || []);
    };

    if (isAdmin(selectedOrganization)) {
      // not open to contributors, will get a 403
      reportSearch();
    }
  }, [selectedOrganization]);

  useEffect(() => {
    // used to prevent double render that was causing infinite render on dev scope (react 18)
    if (!initialized.current) {
      initialized.current = true;
      const getModuleProjectId = async () => {
        const moduleProject = projectModules.find(({ id, modules }) => modules !== undefined);

        if (!moduleProject) {
          return;
        }

        setModuleProjectId(moduleProject.id);
      };

      getModuleProjectId();
    }
  }, [projectModules]);

  useEffect(() => {
    const fetchDeliverables = async () => {
      // TODO I think we should pull this out of redux
      // using a direct service call, without redux, to keep with existing pattern in the nav bars
      const response = await DeliverablesService.list(activeLocale, {
        organizationId: selectedOrganization.id,
      });
      setHasDeliverables(!!(response && response.deliverables.length > 0));
    };
    if (isManagerOrHigher(selectedOrganization)) {
      fetchDeliverables();
    } else {
      setHasDeliverables(false);
    }
  }, [activeLocale, selectedOrganization]);

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
      hasDeliverables ? (
        <NavItem
          label={strings.DELIVERABLES}
          icon='iconSubmit'
          selected={!!isDeliverablesRoute}
          onClick={() => {
            closeAndNavigateTo(isDeliverablesRoute && !isDeliverableViewRoute ? '' : APP_PATHS.DELIVERABLES);
          }}
          id='deliverables'
        />
      ) : null,
    [closeAndNavigateTo, isDeliverablesRoute, isDeliverableViewRoute, hasDeliverables]
  );

  const reportsMenu = useMemo<JSX.Element | null>(
    () =>
      reports.length > 0 && selectedOrganization.canSubmitReports ? (
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
    [closeAndNavigateTo, isReportsRoute, reports.length, selectedOrganization.canSubmitReports]
  );

  const modulesMenu = useMemo<JSX.Element | null>(
    () =>
      featureFlagParticipantExperience && moduleProjectId ? (
        <NavItem
          icon='iconModule'
          label={strings.MODULES}
          selected={!!isProjectModulesRoute}
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.PROJECT_MODULES.replace(':projectId', moduleProjectId.toString()));
          }}
          id='reports-list'
        />
      ) : null,
    [closeAndNavigateTo, featureFlagParticipantExperience, isProjectModulesRoute, moduleProjectId]
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
            selected={isAccessionsRoute || isCheckinRoute ? true : false}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.ACCESSIONS);
            }}
            id='accessions'
          />
          <NavItem
            label={strings.MONITORING}
            selected={!!isMonitoringRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.MONITORING);
            }}
            id='monitoring'
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

      {(deliverablesMenu || modulesMenu || reportsMenu) && (
        <>
          <NavSection title={acceleratorSectionTitle} />
          {deliverablesMenu}
          {modulesMenu}
          {reportsMenu}
        </>
      )}

      {isAdmin(selectedOrganization) && (
        <>
          <NavSection title={strings.SETTINGS.toUpperCase()} />
          <NavItem
            label={strings.ORGANIZATION}
            icon='organizationNav'
            selected={!!isOrganizationRoute}
            onClick={() => {
              closeAndNavigateTo(isOrganizationRoute ? '' : APP_PATHS.ORGANIZATION);
            }}
            id='organization'
          />
          <NavItem
            label={strings.PEOPLE}
            icon='peopleNav'
            selected={!!isPeopleRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.PEOPLE);
            }}
            id='people'
          />
          <NavItem
            label={strings.PROJECTS}
            icon='iconFolder'
            selected={!!isProjectsRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.PROJECTS);
            }}
            id='projects'
          />
          <NavItem label={strings.LOCATIONS} icon='iconMyLocation' id='locations'>
            <SubNavbar>
              <NavItem
                label={strings.SEED_BANKS}
                selected={!!isSeedbanksRoute}
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
        <NavItem
          label={strings.CONTACT_US}
          icon='mail'
          selected={!!isContactUsRoute}
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.CONTACT_US);
          }}
          id='contactus'
        />

        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
