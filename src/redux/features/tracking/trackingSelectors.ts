import { RootState } from 'src/redux/rootReducer';
import { PlantingSite } from 'src/types/Tracking';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;

export const selectPlantingSite = (state: RootState, plantingSiteId: number) =>
  selectPlantingSites(state)?.find((site: PlantingSite) => site.id === plantingSiteId);
