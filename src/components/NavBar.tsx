import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import NavSection from 'src/components/common/Navbar/NavSection';
import SubNavbar from 'src/components/common/Navbar/SubNavbar';
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

  const isAccessionSummaryRoute = useRouteMatch('/seeds-summary');
  const isAccessionsRoute = useRouteMatch('/accessions/');
  const isCheckinRoute = useRouteMatch('/checkin/');
  const isContactUsRoute = useRouteMatch('/contactus');
  const isHomeRoute = useRouteMatch('/home');
  const isPeopleRoute = useRouteMatch('/people');
  const isPlantDashboardRoute = useRouteMatch('/plants-dashboard');
  const isPlantListRoute = useRouteMatch('/plants-list');
  const isProjectsRoute = useRouteMatch('/projects');
  const isSitesRoute = useRouteMatch('/sites');
  const isSpeciesRoute = useRouteMatch('/species');
  const isOrganizationRoute = useRouteMatch('/organization');

  const navigate = (url: string) => {
    history.push(url);
  };

  return (
    <Navbar>
      <NavItem label='Home' icon='home' selected={!!isHomeRoute} onClick={() => navigate('/home')} id='dashboard' />
      <NavItem
        label='Seeds'
        icon='seeds'
        id='seeds'
        onClick={() => !isAccessionSummaryRoute && navigate('/seeds-summary')}
      >
        <SubNavbar>
          <NavItem
            label='Summary'
            selected={!!isAccessionSummaryRoute}
            onClick={() => !isAccessionSummaryRoute && navigate('/seeds-summary')}
            id='summary'
          />

          <NavItem
            label='Accessions'
            selected={isAccessionsRoute || isCheckinRoute ? true : false}
            onClick={() => navigate('/accessions')}
            id='accessions'
          />
        </SubNavbar>
      </NavItem>
      <NavItem
        label={strings.PLANTS}
        icon='restorationSite'
        onClick={() => !isPlantDashboardRoute && navigate('/plants-dashboard')}
        id='plants'
      >
        <SubNavbar>
          <NavItem
            label={strings.DASHBOARD}
            selected={!!isPlantDashboardRoute}
            onClick={() => !isPlantDashboardRoute && navigate('/plants-dashboard')}
            id='dashboard'
          />

          <NavItem
            label={strings.PLANTS_LIST}
            selected={!!isPlantListRoute}
            onClick={() => navigate('/plants-list')}
            id='plants-list'
          />
        </SubNavbar>
      </NavItem>

      <NavItem
        label={strings.SPECIES}
        icon='species'
        selected={!!isSpeciesRoute}
        onClick={() => navigate('/species')}
        id='speciesNb'
      />
      <NavSection />
      {role && HighOrganizationRolesValues.includes(role) && (
        <>
          <NavItem
            label={strings.PROJECTS}
            icon='folder'
            selected={!!isProjectsRoute}
            onClick={() => navigate('/projects')}
            id='projects'
          />
          <NavItem
            label={strings.SITES}
            icon='site'
            selected={!!isSitesRoute}
            onClick={() => navigate('/sites')}
            id='sites'
          />
        </>
      )}
      <NavSection />
      {role && ['Admin', 'Owner'].includes(role) && (
        <NavItem
          label={strings.ADMIN}
          icon='key'
          onClick={() => !isOrganizationRoute && navigate('/organization')}
          id='admin'
        >
          <SubNavbar>
            <NavItem
              label={strings.ORGANIZATION}
              selected={!!isOrganizationRoute}
              onClick={() => !isOrganizationRoute && navigate('/organization')}
              id='organization'
            />
            <NavItem
              label={strings.PEOPLE}
              selected={!!isPeopleRoute}
              onClick={() => navigate('/people')}
              id='people'
            />
          </SubNavbar>
        </NavItem>
      )}
      <NavItem
        label={dictionary.CONTACT_US}
        selected={!!isContactUsRoute}
        onClick={() => navigate('/contactus')}
        id='contactus'
        isFooter={true}
      />
    </Navbar>
  );
}
