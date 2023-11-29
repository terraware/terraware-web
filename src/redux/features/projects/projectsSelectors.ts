import { RootState } from 'src/redux/rootReducer';

export const selectProjects = (state: RootState) => state.projects.projects;
