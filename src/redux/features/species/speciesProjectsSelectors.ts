import { RootState } from 'src/redux/rootReducer';

export const selectSpeciesProjects = (speciesId: number) => (state: RootState) => state.speciesProjects[speciesId];
