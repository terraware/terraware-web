import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import FunderProjectService, { FunderProjectData } from 'src/services/funder/FunderProjectService';
import strings from 'src/strings';

export const requestGetFunderProject = createAsyncThunk(
  'funderProjects/get-one',
  async (projectId: number, { rejectWithValue }) => {
    const response: Response2<FunderProjectData> = await FunderProjectService.get(projectId);

    if (response && response.requestSucceeded) {
      return response.data?.details;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
