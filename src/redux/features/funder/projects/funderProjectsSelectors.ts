import { RootState } from 'src/redux/rootReducer';

export const selectFunderProjectRequest = (projectId: number) => (state: RootState) => state.funderProject[projectId];

export const selectPublishFunderProject = (requestId: string) => (state: RootState) =>
  state.publishFunderProject[requestId];
