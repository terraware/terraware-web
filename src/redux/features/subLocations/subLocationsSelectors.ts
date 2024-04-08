import { RootState } from 'src/redux/rootReducer';

export const selectSubLocations = (state: RootState) => state.subLocations.subLocations;
