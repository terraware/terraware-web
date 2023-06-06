import { RootState } from 'src/redux/rootReducer';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;
export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;
