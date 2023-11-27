import { useCallback, useEffect, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import SubNavbar from '@terraware/web-components/components/Navbar/SubNavbar';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { NurseryWithdrawalService } from 'src/services';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import NavFooter from './common/Navbar/NavFooter';
import { useOrganization } from 'src/providers/hooks';
import LocaleSelector from './LocaleSelector';
import ReportService, { Reports } from 'src/services/ReportService';
import { isAdmin } from 'src/utils/organization';

type NavBarProps = {
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundTransparent?: boolean;
  withdrawalCreated?: boolean;
  hasPlantingSites?: boolean;
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
  const { isDesktop } = useDeviceInfo();
  const navigate = useNavigate();

  const isAccessionDashboardRoute = useMatch(APP_PATHS.SEEDS_DASHBOARD + '/');
  const isAccessionsRoute = useMatch(APP_PATHS.ACCESSIONS + '/');
  const isCheckinRoute = useMatch(APP_PATHS.CHECKIN + '/');
  const isContactUsRoute = useMatch(APP_PATHS.CONTACT_US + '/');
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

  const navigateTo = (url: string) => {
    navigate(url);
  };

  const closeAndNavigateTo = (path: string) => {
    closeNavBar();
    if (path) {
      navigateTo(path);
    }
  };

  const closeNavBar = () => {
    if (!isDesktop) {
      setShowNavBar(false);
    }
  };

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

    reportSearch();
  }, [selectedOrganization.id]);

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

  return (
    <Navbar setShowNavBar={setShowNavBar} backgroundTransparent={backgroundTransparent}>
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
      {reports.length > 0 && selectedOrganization.canSubmitReports && (
        <>
          <NavSection />
          <NavItem
            icon='iconGraphReport'
            label={strings.REPORTS}
            selected={!!isReportsRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.REPORTS);
            }}
            id='reports-list'
          />
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
