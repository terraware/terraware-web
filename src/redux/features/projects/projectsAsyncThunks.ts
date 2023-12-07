import { createAsyncThunk } from '@reduxjs/toolkit';
import { UpdateProjectRequest } from 'src/types/Project';
import { Response2 } from 'src/services/HttpService';
import ProjectsService, { UpdateProjectResponsePayload } from 'src/services/ProjectsService';
import strings from 'src/strings';

export const requestProjectUpdate = createAsyncThunk(
  'projectUpdate',
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
