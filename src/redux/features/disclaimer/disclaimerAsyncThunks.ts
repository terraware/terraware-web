import { createAsyncThunk } from '@reduxjs/toolkit';

import DisclaimerService from 'src/services/DisclaimerService';
import strings from 'src/strings';

export const requestDisclaimer = createAsyncThunk('disclaimer/get', async (_: void, { rejectWithValue }) => {
  const response = await DisclaimerService.getDisclaimer();
  if (response && response.requestSucceeded) {
    return response.data?.disclaimer;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestAcceptDisclaimer = createAsyncThunk('disclaimer/accept', async (_: void, { rejectWithValue }) => {
  const response = await DisclaimerService.acceptDisclaimer();
  if (response && response.requestSucceeded) {
    return;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});
