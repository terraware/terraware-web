import { useHistory, useRouteMatch } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';
import { plantsPlantedSelector } from '../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../state/selectors/plantsPlantedFeatures';
import { plantsPlantedFilteredSelector } from '../state/selectors/plantsPlantedFiltered';
import sessionSelector from '../state/selectors/session';
import strings from '../strings';
import Navbar from './common/Navbar/Navbar';
import NavItem from './common/Navbar/NavItem';
import NavSection from './common/Navbar/NavSection';
import SubNavbar from './common/Navbar/SubNavbar';

export default function NavBar(): JSX.Element | null {
  const history = useHistory();

  const isDashboardRoute = useRouteMatch('/dashboard/');
  const isSpeciesRoute = useRouteMatch('/species/');
  const isPlantsRoute = useRouteMatch('/plants/');
  const resetSession = useResetRecoilState(sessionSelector);
  const resetPlantsPlanted = useResetRecoilState(plantsPlantedSelector);
  const resetPlantsPlantedFiltered = useResetRecoilState(
    plantsPlantedFilteredSelector
  );
  const resetPlantsPlantedFeatures = useResetRecoilState(
    plantsPlantedFeaturesSelector
  );

  const logout = () => {
    resetSession();
  };

  const navigate = (url: string) => {
    history.push(url);
  };

  const navigateToDashboard = () => {
    resetPlantsPlanted();
    navigate('/dashboard');
  };

  const navigateToAllPlants = () => {
    resetPlantsPlantedFeatures();
    resetPlantsPlantedFiltered();
    navigate('/plants');
  };

  return (
    <Navbar>
      <NavItem
        label='Home'
        icon='home'
        selected={isDashboardRoute ? true : false}
        onClick={() => navigateToDashboard()}
        id='dashboard'
      />
      <NavSection title={strings.FLORA} />
      <NavItem label='Seeds' icon='seeds'>
        <SubNavbar>
          <NavItem label='Summary' selected={false} />
          <NavItem label='Accessions' selected={false} />
        </SubNavbar>
      </NavItem>
      <NavItem
        label={strings.ALL_PLANTS}
        icon='restorationSite'
        selected={isPlantsRoute ? true : false}
        onClick={() => navigateToAllPlants()}
        id='plants'
      />
      <NavItem
        label={strings.SPECIES}
        icon='species'
        selected={isSpeciesRoute ? true : false}
        onClick={() => navigate('/species')}
        id='species'
      />
      <NavSection />
      <NavItem label='Projects' icon='folder' selected={false} />
      <NavItem label='Sites' icon='site' selected={false} />
      <NavSection />
      <NavItem label='Admin' icon='key' selected={false} />
      <NavItem
        label={strings.LOGOUT}
        icon='key'
        selected={false}
        onClick={logout}
        id='logout'
      />
    </Navbar>
  );
}
