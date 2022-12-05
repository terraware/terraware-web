import SubNavbar from '@terraware/web-components/components/Navbar/SubNavbar';
import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { AllOrganizationRoles, ServerOrganization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import NavFooter from './common/Navbar/NavFooter';

type NavBarProps = {
  organization?: ServerOrganization;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundTransparent?: boolean;
};
export default function NavBar({
  organization,
  setShowNavBar,
  backgroundTransparent,
}: NavBarProps): JSX.Element | null {
  const [role, setRole] = useState<AllOrganizationRoles>();
  const { isDesktop } = useDeviceInfo();

  useEffect(() => {
    if (organization) {
      setRole(organization.role);
    }
  }, [organization]);
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
  const isPlantingSitesRoute = useRouteMatch(APP_PATHS.PLANTING_SITES + '/');
  const isPlantsDashboardRoute = useRouteMatch(APP_PATHS.PLANTS_DASHBOARD + '/');
  const isWithdrawalLogRoute = useRouteMatch(APP_PATHS.NURSERY_WITHDRAWALS + '/');

  const trackingEnabled = isEnabled('Tracking V1');

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

  return (
    <Navbar setShowNavBar={setShowNavBar} backgroundTransparent={backgroundTransparent}>
      <NavItem
        label='Home'
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
      <NavItem
        label='Seeds'
        icon='seeds'
        id='seeds'
        onClick={() => {
          closeAndNavigateTo(isAccessionDashboardRoute ? '' : APP_PATHS.SEEDS_DASHBOARD);
        }}
      >
        <SubNavbar>
          <NavItem
            label='Dashboard'
            selected={!!isAccessionDashboardRoute}
            onClick={() => {
              closeAndNavigateTo(isAccessionDashboardRoute ? '' : APP_PATHS.SEEDS_DASHBOARD);
            }}
            id='seeds-dashboard'
          />
          <NavItem
            label='Accessions'
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
      <NavItem
        label='Seedlings'
        icon='iconSeedling'
        id='seedlings'
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.INVENTORY);
        }}
      >
        <SubNavbar>
          <NavItem
            label={strings.INVENTORY}
            selected={!!isInventoryRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.INVENTORY);
            }}
            id='inventory'
          />
          {trackingEnabled && (
            <NavItem
              label={strings.WITHDRAWAL_LOG}
              selected={!!isWithdrawalLogRoute}
              onClick={() => {
                closeAndNavigateTo(APP_PATHS.NURSERY_WITHDRAWALS);
              }}
              id='inventory'
            />
          )}
        </SubNavbar>
      </NavItem>
      {trackingEnabled && (
        <NavItem
          label={strings.PLANTS}
          icon='iconRestorationSite'
          id='plants'
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.PLANTS_DASHBOARD);
          }}
        >
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
      )}
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
          <NavItem
            label='Locations'
            icon='seedbankNav'
            id='locations'
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.SEED_BANKS);
            }}
          >
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
              {trackingEnabled && (
                <NavItem
                  label={strings.PLANTING_SITES}
                  selected={!!isPlantingSitesRoute}
                  onClick={() => {
                    closeAndNavigateTo(APP_PATHS.PLANTING_SITES);
                  }}
                  id='plantingSites'
                />
              )}
            </SubNavbar>
          </NavItem>
        </>
      )}

      <NavFooter>
        <NavItem
          label={dictionary.CONTACT_US}
          icon='mail'
          selected={!!isContactUsRoute}
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.CONTACT_US);
          }}
          id='contactus'
        />
      </NavFooter>
    </Navbar>
  );
}
