import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { AllOrganizationRoles, ServerOrganization, HighOrganizationRolesValues } from 'src/types/Organization';
import NavFooter from './common/Navbar/NavFooter';

type NavBarProps = {
  organization?: ServerOrganization;
};
export default function NavBar({ organization }: NavBarProps): JSX.Element | null {
  const [role, setRole] = useState<AllOrganizationRoles>();

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
  const isProjectsRoute = useRouteMatch(APP_PATHS.PROJECTS + '/');
  const isSitesRoute = useRouteMatch(APP_PATHS.SITES + '/');
  const isSpeciesRoute = useRouteMatch(APP_PATHS.SPECIES + '/');
  const isOrganizationRoute = useRouteMatch(APP_PATHS.ORGANIZATION + '/');
  const isMonitoringRoute = useRouteMatch(APP_PATHS.MONITORING + '/');
  const isSeedbanksRoute = useRouteMatch(APP_PATHS.SEED_BANKS + '/');

  const navigate = (url: string) => {
    history.push(url);
  };

  return (
    <Navbar>
      <NavItem label='Home' icon='home' selected={!!isHomeRoute} onClick={() => navigate(APP_PATHS.HOME)} id='home' />
      <NavItem
        label={strings.SPECIES}
        icon='species'
        selected={!!isSpeciesRoute}
        onClick={() => navigate(APP_PATHS.SPECIES)}
        id='speciesNb'
      />

      <NavSection title={strings.SEEDS.toUpperCase()} />
      <NavItem
        label='Dashboard'
        icon='dashboard'
        selected={!!isAccessionDashboardRoute}
        onClick={() => !isAccessionDashboardRoute && navigate(APP_PATHS.SEEDS_DASHBOARD)}
        id='seeds-dashboard'
      />
      <NavItem
        label='Accessions'
        icon='seeds'
        selected={isAccessionsRoute || isCheckinRoute ? true : false}
        onClick={() => navigate(APP_PATHS.ACCESSIONS)}
        id='accessions'
      />
      <NavItem
        label={strings.MONITORING}
        icon='monitoringNav'
        selected={!!isMonitoringRoute}
        onClick={() => navigate(APP_PATHS.MONITORING)}
        id='monitoring'
      />

      {role && HighOrganizationRolesValues.includes(role) && (
        <>
          <NavSection />
          <NavItem
            label={strings.PROJECTS}
            icon='folder'
            selected={!!isProjectsRoute}
            onClick={() => navigate(APP_PATHS.PROJECTS)}
            id='projects'
          />
          <NavItem
            label={strings.SITES}
            icon='site'
            selected={!!isSitesRoute}
            onClick={() => navigate(APP_PATHS.SITES)}
            id='sites'
          />
        </>
      )}
      {role && ['Admin', 'Owner'].includes(role) && (
        <>
          <NavSection title={strings.SETTINGS.toUpperCase()} />
          <NavItem
            label={strings.ORGANIZATION}
            icon='organizationNav'
            selected={!!isOrganizationRoute}
            onClick={() => !isOrganizationRoute && navigate(APP_PATHS.ORGANIZATION)}
            id='organization'
          />
          <NavItem
            label={strings.PEOPLE}
            icon='peopleNav'
            selected={!!isPeopleRoute}
            onClick={() => navigate(APP_PATHS.PEOPLE)}
            id='people'
          />
          <NavItem
            label={strings.SEED_BANKS}
            icon='seedbankNav'
            selected={!!isSeedbanksRoute}
            onClick={() => navigate(APP_PATHS.SEED_BANKS)}
            id='seedbanks'
          />
        </>
      )}

      <NavFooter>
        <NavItem
          label={dictionary.CONTACT_US}
          icon='mail'
          selected={!!isContactUsRoute}
          onClick={() => navigate(APP_PATHS.CONTACT_US)}
          id='contactus'
        />
      </NavFooter>
    </Navbar>
  );
}
