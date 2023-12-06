import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import ProjectsService from 'src/services/ProjectsService';
import { setProjectAction, setProjectsAction } from './projectsSlice';

export const requestProjects = (organizationId: number, locale?: string | null) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ProjectsService.listProjects(organizationId, locale);
      const { error, projects } = response;
      dispatch(setProjectsAction({ error, projects }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching projects', e);
    }
  };
};

export const requestProject = (projectId: number) => async (dispatch: Dispatch, _getState: () => RootState) => {
  try {
    const response = await ProjectsService.getProject(projectId);
    const { error, data } = response;
    if (data) {
      dispatch(setProjectAction({ error, projects: [data] }));
    }
  } catch (e) {
    // should not happen, the response above captures any http request errors
    // tslint:disable-next-line: no-console
    console.error('Error dispatching projects', e);
  }
};
