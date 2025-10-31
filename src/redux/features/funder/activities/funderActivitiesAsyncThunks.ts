import { createAsyncThunk } from '@reduxjs/toolkit';

import FunderActivityService from 'src/services/funder/FunderActivityService';
import strings from 'src/strings';

export const requestListFunderActivities = createAsyncThunk(
  'funderActivities/list',
  async (projectId: number, { rejectWithValue }) => {
    const response = await FunderActivityService.getAll(projectId, true);
    if (response && response.requestSucceeded) {
      return response.data?.activities ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
