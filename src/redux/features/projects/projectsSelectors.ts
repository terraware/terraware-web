import { RootState } from 'src/redux/rootReducer';
import { Project } from 'src/types/Project';

export const selectProjects = (state: RootState) => state.projects.projects;

export const selectProject =
  (projectId: number) =>
  (state: RootState): Project | undefined =>
    state.projects?.projects?.find((project) => project.id === projectId);

export const selectProjectRequest = (state: RootState, requestId: string) => state.projectsRequests[requestId];

export const selectProjectInternalUsersRequest = (state: RootState, requestId: string) =>
  state.projectInternalUsers[requestId];

export const selectProjectInternalUsersListRequest = (state: RootState, requestId: string) =>
  state.projectInternalUsersList[requestId];
