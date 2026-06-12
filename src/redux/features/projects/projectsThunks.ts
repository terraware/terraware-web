import { Dispatch } from 'redux';

import { setProjectAction } from 'src/redux/features/projects/projectsSlice';
import { RootState } from 'src/redux/rootReducer';
import ProjectsService from 'src/services/ProjectsService';

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
