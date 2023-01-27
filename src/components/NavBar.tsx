import { useCallback, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import SubNavbar from '@terraware/web-components/components/Navbar/SubNavbar';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { OrganizationRole } from 'src/types/Organization';
import { hasNurseryWithdrawals } from 'src/api/tracking/withdrawals';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import NavFooter from './common/Navbar/NavFooter';
import { useOrganization } from 'src/providers/hooks';
import LocaleSelector from './LocaleSelector';
import isEnabled from '../features';

type NavBarProps = {
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundTransparent?: boolean;
  withdrawalCreated?: boolean;
};
export default function NavBar({
  setShowNavBar,
  backgroundTransparent,
  withdrawalCreated,
}: NavBarProps): JSX.Element | null {
  const { selectedOrganization } = useOrganization();
  const [role, setRole] = useState<OrganizationRole>();
  const [showNurseryWithdrawals, setShowNurseryWithdrawals] = useState<boolean>(false);
  const { isDesktop } = useDeviceInfo();
  const history = useHistory();

  const isAccessionDashboardRoute = useRouteMatch(APP_PATHS.SEEDS_DASHBOARD + '/');
  const isAccessionsRoute = useRouteMatch(APP_PATHS.ACCESSIONS + '/');
  const isCheckinRoute = useRouteMatch(APP_PATHS.CHECKIN + '/');
  const isContactUsRoute = useRouteMatch(APP_PATHS.CONTACT_US + '/');
  const isHomeRoute = useRouteMatch(APP_PATHS.HOME + '/');
  const isPeopleRoute = useRouteMatch(APP_PATHS.PEOPLE + '/');
  const isSpeciesRoute = useRouteMatch(APP_PATHS.SPECIES + '/');
  const isOrganizationRoute = useRouteMatch(APP_PATHS.ORGANIZATION + '/');
  const isMonitoringRoute = useRouteMatch(APP_PATHS.MONITORING + '/');
  const isSeedbanksRoute = useRouteMatch(APP_PATHS.SEED_BANKS + '/');
  const isNurseriesRoute = useRouteMatch(APP_PATHS.NURSERIES + '/');
  const isInventoryRoute = useRouteMatch(APP_PATHS.INVENTORY + '/');
  const isBatchWithdrawRoute = useRouteMatch(APP_PATHS.BATCH_WITHDRAW + '/');
  const isPlantingSitesRoute = useRouteMatch(APP_PATHS.PLANTING_SITES + '/');
  const isPlantsDashboardRoute = useRouteMatch(APP_PATHS.PLANTS_DASHBOARD + '/');
  const isWithdrawalLogRoute = useRouteMatch(APP_PATHS.NURSERY_WITHDRAWALS + '/');
  const isReassignmentRoute = useRouteMatch(APP_PATHS.NURSERY_REASSIGNMENT + '/');

  const navigate = (url: string) => {
    history.push(url);
  };

  const closeAndNavigateTo = (path: string) => {
    closeNavBar();
    if (path) {
      navigate(path);
    }
  };

  const closeNavBar = () => {
    if (!isDesktop) {
      setShowNavBar(false);
    }
  };

  const checkNurseryWithdrawals = useCallback(() => {
    hasNurseryWithdrawals(selectedOrganization.id).then((result) => {
      setShowNurseryWithdrawals(result);
    });
  }, [selectedOrganization.id]);

  useEffect(() => {
    setShowNurseryWithdrawals(false);
    if (selectedOrganization) {
      setRole(selectedOrganization.role);
      checkNurseryWithdrawals();
    }
  }, [selectedOrganization, checkNurseryWithdrawals]);

  useEffect(() => {
    if (withdrawalCreated && !showNurseryWithdrawals) {
      checkNurseryWithdrawals();
    }
  }, [withdrawalCreated, checkNurseryWithdrawals, showNurseryWithdrawals]);

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
        label={strings.WITHDRAWAL_LOG}
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
        </SubNavbar>
      </NavItem>
      {role && ['Admin', 'Owner'].includes(role) && (
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
          <NavItem label={strings.LOCATIONS} icon='seedbankNav' id='locations'>
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

        {isEnabled('Locale selection') && <LocaleSelector />}
      </NavFooter>
    </Navbar>
  );
}
