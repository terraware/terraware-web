import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import SubNavbar from 'src/components/common/Navbar/SubNavbar';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { AllOrganizationRoles, ServerOrganization, HighOrganizationRolesValues } from 'src/types/Organization';

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
  const isPlantDashboardRoute = useRouteMatch(APP_PATHS.PLANTS_DASHBOARD + '/');
  const isPlantListRoute = useRouteMatch(APP_PATHS.PLANTS_LIST + '/');
  const isProjectsRoute = useRouteMatch(APP_PATHS.PROJECTS + '/');
  const isSitesRoute = useRouteMatch(APP_PATHS.SITES + '/');
  const isSpeciesRoute = useRouteMatch(APP_PATHS.SPECIES + '/');
  const isOrganizationRoute = useRouteMatch(APP_PATHS.ORGANIZATION + '/');

  const navigate = (url: string) => {
    history.push(url);
  };

  return (
    <Navbar>
      <NavItem label='Home' icon='home' selected={!!isHomeRoute} onClick={() => navigate(APP_PATHS.HOME)} id='home' />
      <NavItem
        label='Seeds'
        icon='seeds'
        id='seeds'
        onClick={() => !isAccessionDashboardRoute && navigate(APP_PATHS.SEEDS_DASHBOARD)}
      >
        <SubNavbar>
          <NavItem
            label='Dashboard'
            selected={!!isAccessionDashboardRoute}
            onClick={() => !isAccessionDashboardRoute && navigate(APP_PATHS.SEEDS_DASHBOARD)}
            id='seeds-dashboard'
          />

          <NavItem
            label='Accessions'
            selected={isAccessionsRoute || isCheckinRoute ? true : false}
            onClick={() => navigate(APP_PATHS.ACCESSIONS)}
            id='accessions'
          />
        </SubNavbar>
      </NavItem>
      <NavItem
        label={strings.PLANTS}
        icon='restorationSite'
        onClick={() => !isPlantDashboardRoute && navigate(APP_PATHS.PLANTS_DASHBOARD)}
        id='plants'
      >
        <SubNavbar>
          <NavItem
            label={strings.DASHBOARD}
            selected={!!isPlantDashboardRoute}
            onClick={() => !isPlantDashboardRoute && navigate(APP_PATHS.PLANTS_DASHBOARD)}
            id='dashboard'
          />

          <NavItem
            label={strings.PLANTS}
            selected={!!isPlantListRoute}
            onClick={() => navigate(APP_PATHS.PLANTS_LIST)}
            id='plants-list'
          />
        </SubNavbar>
      </NavItem>

      <NavItem
        label={strings.SPECIES}
        icon='species'
        selected={!!isSpeciesRoute}
        onClick={() => navigate(APP_PATHS.SPECIES)}
        id='speciesNb'
      />
      <NavSection />
      {role && HighOrganizationRolesValues.includes(role) && (
        <>
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
      <NavSection />
      {role && ['Admin', 'Owner'].includes(role) && (
        <NavItem
          label={strings.ADMIN}
          icon='key'
          onClick={() => !isOrganizationRoute && navigate(APP_PATHS.ORGANIZATION)}
          id='admin'
        >
          <SubNavbar>
            <NavItem
              label={strings.ORGANIZATION}
              selected={!!isOrganizationRoute}
              onClick={() => !isOrganizationRoute && navigate(APP_PATHS.ORGANIZATION)}
              id='organization'
            />
            <NavItem
              label={strings.PEOPLE}
              selected={!!isPeopleRoute}
              onClick={() => navigate(APP_PATHS.PEOPLE)}
              id='people'
            />
          </SubNavbar>
        </NavItem>
      )}
      <NavItem
        label={dictionary.CONTACT_US}
        icon={'help'}
        selected={!!isContactUsRoute}
        onClick={() => navigate(APP_PATHS.CONTACT_US)}
        id='contactus'
        isFooter={true}
      />
    </Navbar>
  );
}
