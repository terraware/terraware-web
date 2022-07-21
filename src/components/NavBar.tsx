import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { AllOrganizationRoles, ServerOrganization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import NavFooter from './common/Navbar/NavFooter';

type NavBarProps = {
  organization?: ServerOrganization;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function NavBar({ organization, setShowNavBar }: NavBarProps): JSX.Element | null {
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
    <Navbar setShowNavBar={setShowNavBar}>
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

      <NavSection title={strings.SEEDS.toUpperCase()} />
      <NavItem
        label='Dashboard'
        icon='dashboard'
        selected={!!isAccessionDashboardRoute}
        onClick={() => {
          closeAndNavigateTo(isAccessionDashboardRoute ? '' : APP_PATHS.SEEDS_DASHBOARD);
        }}
        id='seeds-dashboard'
      />
      <NavItem
        label='Accessions'
        icon='seeds'
        selected={isAccessionsRoute || isCheckinRoute ? true : false}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.ACCESSIONS);
        }}
        id='accessions'
      />
      <NavItem
        label={strings.MONITORING}
        icon='monitoringNav'
        selected={!!isMonitoringRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.MONITORING);
        }}
        id='monitoring'
      />
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
            label={strings.SEED_BANKS}
            icon='seedbankNav'
            selected={!!isSeedbanksRoute}
            onClick={() => {
              closeAndNavigateTo(APP_PATHS.SEED_BANKS);
            }}
            id='seedbanks'
          />
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
