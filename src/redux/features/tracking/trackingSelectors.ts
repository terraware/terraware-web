import { RootState } from 'src/redux/rootReducer';
import { PlantingSite } from 'src/types/Tracking';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;
export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;

export const selectPlantingSite = (state: RootState, plantingSiteId: number) =>
  selectPlantingSites(state)?.find((site: PlantingSite) => site.id === plantingSiteId);

export const selectSitePopulation = (state: RootState) => state.sitePopulation?.zones;

export const selectSitePopulationError = (state: RootState) => state.sitePopulation?.error;
