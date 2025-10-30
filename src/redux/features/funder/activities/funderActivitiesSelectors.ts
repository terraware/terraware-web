import { RootState } from 'src/redux/rootReducer';

export const selectListFunderActivities = (projectId: string) => (state: RootState) =>
  state.funderActivities[projectId];
