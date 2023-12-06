import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import ProjectsService, { UpdateProjectResponsePayload } from 'src/services/ProjectsService';
import { setProjectAction, setProjectsAction } from './projectsSlice';
import { UpdateProjectRequest } from '../../../types/Project';
import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from '../../../strings';
import { Response2 } from '../../../services/HttpService';

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

export const requestProjectUpdate = createAsyncThunk(
  'requestProjectUpdate',
  async (request: { projectId: number; project: UpdateProjectRequest }, { rejectWithValue }) => {
    const response: Response2<UpdateProjectResponsePayload> = await ProjectsService.updateProject(
      request.projectId,
      request.project
    );
    console.log('response', response);
    if (response !== null) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
