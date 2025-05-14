import { RootState } from 'src/redux/rootReducer';

export const selectSpecies = (organizationId: number) => (state: RootState) => state.species[organizationId];

export const selectSpeciesGetOneRequest = (requestId: string) => (state: RootState) => state.speciesGetOne[requestId];
export const selectSpeciesListRequest = (requestId: string) => (state: RootState) => state.speciesList[requestId];
export const selectSpeciesUpdateRequest = (requestId: string) => (state: RootState) => state.speciesUpdate[requestId];

export const selectMergeOtherSpecies = (requestId: string) => (state: RootState) => state.mergeOtherSpecies[requestId];
