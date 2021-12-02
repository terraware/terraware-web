import { useHistory, useRouteMatch } from 'react-router-dom';
import strings from 'src/strings';
import Navbar from './common/Navbar/Navbar';
import NavItem from './common/Navbar/NavItem';
import NavSection from './common/Navbar/NavSection';
import SubNavbar from './common/Navbar/SubNavbar';

export default function NavBar(): JSX.Element | null {
  const history = useHistory();

  const isHomeRoute = useRouteMatch('/home');
  const isAccessionSummaryRoute = useRouteMatch('/seeds-summary');
  const isAccessionsRoute = useRouteMatch('/accessions/');
  const isCheckinRoute = useRouteMatch('/checkin/');
  const isPlantDashboardRoute = useRouteMatch('/plants-dashboard');
  const isPlantListRoute = useRouteMatch('/plants-list');
  const isSpeciesRoute = useRouteMatch('/species');

  const navigate = (url: string) => {
    history.push(url);
  };

  return (
    <Navbar>
      <NavItem
        label='Home'
        icon='home'
        selected={isHomeRoute ? true : false}
        onClick={() => navigate('/home')}
        id='dashboard'
      />
      <NavSection title={strings.FLORA} />
      <NavItem
        label='Seeds'
        icon='seeds'
        id='seeds'
        onClick={() => !isAccessionSummaryRoute && navigate('/seeds-summary')}
      >
        <SubNavbar>
          <NavItem
            label='Summary'
            selected={isAccessionSummaryRoute ? true : false}
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
            selected={isPlantDashboardRoute ? true : false}
            onClick={() => !isPlantDashboardRoute && navigate('/plants-dashboard')}
            id='dashboard'
          />

          <NavItem
            label={strings.PLANTS_LIST}
            selected={isPlantListRoute ? true : false}
            onClick={() => navigate('/plants-list')}
            id='plants-list'
          />
        </SubNavbar>
      </NavItem>

      <NavItem
        label={strings.SPECIES}
        icon='species'
        selected={isSpeciesRoute ? true : false}
        onClick={() => navigate('/species')}
        id='speciesNb'
      />
    </Navbar>
  );
}
