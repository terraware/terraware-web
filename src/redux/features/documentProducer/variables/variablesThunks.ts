import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import VariableService from 'src/services/documentProducer/VariableService';
import strings from 'src/strings';
import { VariableListResponse } from 'src/types/documentProducer/Variable';

export const requestListVariables = createAsyncThunk(
  'listVariables',
  async (manifestId: number, { rejectWithValue }) => {
    const response: Response2<VariableListResponse> = await VariableService.getVariables(manifestId);
    if (response && response.requestSucceeded && response.data) {
      return response.data.variables;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
