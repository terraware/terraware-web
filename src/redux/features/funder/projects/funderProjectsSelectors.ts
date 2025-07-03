import { RootState } from 'src/redux/rootReducer';

export const selectFunderProjectRequest = (projectId: number) => (state: RootState) => state.funderProjects[projectId];

export const selectPublishFunderProject = (requestId: string) => (state: RootState) =>
  state.publishFunderProject[requestId];
