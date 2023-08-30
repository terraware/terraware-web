import { RootState } from 'src/redux/rootReducer';

export const selectSpecies = (state: RootState) => state.species?.species;
export const selectSpeciesError = (state: RootState) => state.species?.error;
