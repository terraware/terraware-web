import { RootState } from 'src/redux/rootReducer';

export const selectSpeciesList = (organizationId: number) => (state: RootState) => state.speciesList[organizationId];

export const selectSpeciesGetOneRequest = (requestId: string) => (state: RootState) => state.speciesGetOne[requestId];
export const selectSpeciesListRequest = (requestId: string) => (state: RootState) => state.speciesList[requestId];
export const selectSpeciesInUseListRequest = (requestId: string) => (state: RootState) =>
  state.speciesInUseList[requestId];
export const selectSpeciesUpdateRequest = (requestId: string) => (state: RootState) => state.speciesUpdate[requestId];

export const selectMergeOtherSpecies = (requestId: string) => (state: RootState) => state.mergeOtherSpecies[requestId];
