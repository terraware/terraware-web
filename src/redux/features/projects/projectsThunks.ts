import { Dispatch } from 'redux';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import ProjectsService, { UpdateProjectResponsePayload } from 'src/services/ProjectsService';
import { UpdateProjectRequest } from 'src/types/Project';
import strings from 'src/strings';
import { Response2 } from 'src/services/HttpService';
import { setProjectAction, setProjectsAction } from 'src/redux/features/projects/projectsSlice';

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
