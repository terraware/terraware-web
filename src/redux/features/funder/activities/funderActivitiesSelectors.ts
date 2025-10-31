import { RootState } from 'src/redux/rootReducer';

export const selectListFunderActivities = (projectId: string) => (state: RootState) =>
  state.funderActivities[projectId];

export const selectListFunderActivitiesRequest = (requestId: string) => (state: RootState) =>
  state.funderActivities[requestId];
