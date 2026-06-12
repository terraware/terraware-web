import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ProjectsService, {
  AssignProjectRequestPayload,
  AssignProjectResponsePayload,
} from 'src/services/ProjectsService';
import strings from 'src/strings';

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
