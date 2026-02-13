import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ProjectsService, {
  AssignProjectRequestPayload,
  AssignProjectResponsePayload,
  DeleteProjectResponsePayload,
  UpdateProjectResponsePayload,
} from 'src/services/ProjectsService';
import strings from 'src/strings';
import { UpdateProjectRequest } from 'src/types/Project';

export const requestProjectUpdate = createAsyncThunk(
  'projects/update',
  async (request: { projectId: number; project: UpdateProjectRequest }, { rejectWithValue }) => {
    const response: Response2<UpdateProjectResponsePayload> = await ProjectsService.updateProject(
      request.projectId,
      request.project
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectDelete = createAsyncThunk(
  'projects/delete',
  async (request: { projectId: number }, { rejectWithValue }) => {
    const response: Response2<DeleteProjectResponsePayload> = await ProjectsService.deleteProject(request.projectId);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectAssign = createAsyncThunk(
  'project/assign',
  async (request: { projectId: number; entities: AssignProjectRequestPayload }, { rejectWithValue }) => {
    const { projectId, entities } = request;
    const response: Response2<AssignProjectResponsePayload> = await ProjectsService.assignProjectToEntities(
      projectId,
      entities
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
