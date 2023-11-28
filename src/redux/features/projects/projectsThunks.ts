import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import ProjectsService from 'src/services/ProjectsService';
import { setProjectsAction } from './projectsSlice';

export const requestProjects = (organizationId: number, locale?: string | null) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ProjectsService.listProjects(organizationId, locale);
      const { error, projects } = response;
      dispatch(setProjectsAction({ error, projects: projects }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching projects', e);
    }
  };
};
