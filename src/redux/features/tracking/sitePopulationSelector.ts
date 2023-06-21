import { RootState } from 'src/redux/rootReducer';

export const selectSitePopulation = (state: RootState) => state.sitePopulation?.zones;

export const selectSitePopulationError = (state: RootState) => state.sitePopulation?.error;
