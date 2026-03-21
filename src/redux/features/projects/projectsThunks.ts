import { Dispatch } from 'redux';

import { setProjectAction, setProjectsAction } from 'src/redux/features/projects/projectsSlice';
import { RootState } from 'src/redux/rootReducer';
import ProjectsService from 'src/services/ProjectsService';

const inFlightRequests = new Map<number | undefined, Promise<void>>();

export const requestProjects = (organizationId?: number, locale?: string | null) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    if (inFlightRequests.has(organizationId)) {
      return inFlightRequests.get(organizationId);
    }

    const request = (async () => {
      try {
        const response = await ProjectsService.listProjects(organizationId, locale);
        const { error, projects } = response;
        dispatch(setProjectsAction({ error, projects }));
      } catch (e) {
        // should not happen, the response above captures any http request errors
        // eslint-disable-next-line no-console
        console.error('Error dispatching projects', e);
      } finally {
        inFlightRequests.delete(organizationId);
      }
    })();

    inFlightRequests.set(organizationId, request);
    return request;
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const requestProject = (projectId: number) => async (dispatch: Dispatch, _getState: () => RootState) => {
  try {
    const response = await ProjectsService.getProject(projectId);
    const { error, data } = response;
    if (data) {
      dispatch(setProjectAction({ error, projects: [data] }));
    }
  } catch (e) {
    // should not happen, the response above captures any http request errors
    // eslint-disable-next-line no-console
    console.error('Error dispatching projects', e);
  }
};
