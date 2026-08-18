import { RootState } from 'src/redux/rootReducer';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;
