import { speciesProjectsReducer } from './speciesProjectsSlice';
import { speciesReducer } from './speciesSlice';

const speciesReducers = {
  species: speciesReducer,
  speciesProjects: speciesProjectsReducer,
};

export default speciesReducers;
