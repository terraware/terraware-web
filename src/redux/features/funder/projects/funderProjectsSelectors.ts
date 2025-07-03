import { RootState } from 'src/redux/rootReducer';
import { FunderProjectDetails } from 'src/types/FunderProject';

export const selectFunderProjects = (projectIds: number[]) => (state: RootState) => {
  const result: Record<number, FunderProjectDetails> = {};
  // todo find a way to memoize
  projectIds.forEach((projectId) => {
    const stateProject = state.funderProjects[projectId];
    if (stateProject) {
      result[projectId] = { ...stateProject };
    }
  });
  return result;
};

export const selectPublishFunderProject = (requestId: string) => (state: RootState) =>
  state.publishFunderProject[requestId];
