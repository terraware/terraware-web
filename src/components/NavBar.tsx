import { useHistory, useRouteMatch } from 'react-router-dom';
import strings from 'src/strings';
import Navbar from './common/Navbar/Navbar';
import NavItem from './common/Navbar/NavItem';
import NavSection from './common/Navbar/NavSection';
import SubNavbar from './common/Navbar/SubNavbar';

export default function NavBar(): JSX.Element | null {
  const history = useHistory();

  const isHomeRoute = useRouteMatch('/home');
  const isPlantsDashboardRoute = useRouteMatch('/plants-dashboard');
  const isSpeciesRoute = useRouteMatch('/species');
  const isPlantsListRoute = useRouteMatch('/plants-list');
  const isAccessionsRoute = useRouteMatch('/accessions/');
  const isAccessionSummaryRoute = useRouteMatch('/seeds-summary');

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
            selected={isAccessionsRoute ? true : false}
            onClick={() => navigate('/accessions')}
            id='accessions'
          />
        </SubNavbar>
      </NavItem>
      <NavItem
        label={strings.PLANTS}
        icon='restorationSite'
        onClick={() => !isPlantsDashboardRoute && navigate('/plants-dashboard')}
        id='plants'
      >
        <SubNavbar>
          <NavItem
            label={strings.DASHBOARD}
            selected={isPlantsDashboardRoute ? true : false}
            onClick={() => !isPlantsDashboardRoute &&  navigate('/plants-dashboard')}
            id='dashboard'
          />

          <NavItem
            label={strings.PLANTS_LIST}
            selected={isPlantsListRoute ? true : false}
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
