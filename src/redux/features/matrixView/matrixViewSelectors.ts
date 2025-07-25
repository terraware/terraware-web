import { RootState } from 'src/redux/rootReducer';

export const selectProjectsWithVariables = (requestId: string) => (state: RootState) =>
  state.projectsWithVariablesRequest[requestId];
