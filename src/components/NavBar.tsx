import { useHistory, useRouteMatch } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';
import { plantsSelector } from 'src/state/selectors/plants/plants';
import { plantsFeaturesSelector } from 'src/state/selectors/plants/plantsFeatures';
import { plantsFilteredSelector } from 'src/state/selectors/plants/plantsFiltered';
import strings from 'src/strings';
import Navbar from './common/Navbar/Navbar';
import NavItem from './common/Navbar/NavItem';
import NavSection from './common/Navbar/NavSection';
import SubNavbar from './common/Navbar/SubNavbar';

export default function NavBar(): JSX.Element | null {
  const history = useHistory();

  const isHomeRoute = useRouteMatch('/home/');
  const isDashboardRoute = useRouteMatch('/plants-dashboard/');
  const isSpeciesRoute = useRouteMatch('/species/');
  const isPlantsRoute = useRouteMatch('/plants/');
  const isAccessionsRoute = useRouteMatch('/accessions/');
  const isSummaryRoute = useRouteMatch('/seeds-summary/');
  const resetplants = useResetRecoilState(plantsSelector);
  const resetplantsFiltered = useResetRecoilState(
    plantsFilteredSelector
  );
  const resetplantsFeatures = useResetRecoilState(
    plantsFeaturesSelector
  );

  const navigate = (url: string) => {
    history.push(url);
  };

  const navigateToDashboard = () => {
    resetplants();
    navigate('/plants-dashboard');
  };

  const navigateToAllPlants = () => {
    resetplantsFeatures();
    resetplantsFiltered();
    navigate('/plants-list');
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
        onClick={() => navigate('/seeds-summary')}
      >
        <SubNavbar>
          <NavItem
            label='Summary'
            selected={isSummaryRoute ? true : false}
            onClick={() => navigate('/seeds-summary')}
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
        onClick={() => navigateToDashboard()}
        id='plants'
      >
        <SubNavbar>
          <NavItem
            label={strings.DASHBOARD}
            selected={isDashboardRoute ? true : false}
            onClick={() => navigateToDashboard()}
            id='dashboard'
          />

          <NavItem
            label={strings.PLANTS_LIST}
            selected={isPlantsRoute ? true : false}
            onClick={() => navigateToAllPlants()}
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
