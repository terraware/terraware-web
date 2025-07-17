import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/rootReducer';
import { FunderProjectDetails } from 'src/types/FunderProject';

export const selectPublishedProjects = (requestId: string) => (state: RootState) => state.publishedProjects[requestId];

export const selectFunderProjects = (projectIds: number[]) =>
  createSelector(
    (state: RootState) => state.funderProjects,
    (funderProjects) => {
      const result: Record<number, FunderProjectDetails> = {};
      projectIds.forEach((projectId) => {
        const stateProject = funderProjects[projectId];
        if (stateProject) {
          result[projectId] = stateProject;
        }
      });
      return result;
    }
  );

export const selectPublishFunderProject = (requestId: string) => (state: RootState) =>
  state.publishFunderProject[requestId];
