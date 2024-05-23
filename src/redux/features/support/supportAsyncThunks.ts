import { createAsyncThunk } from '@reduxjs/toolkit';

import { SupportService } from 'src/services';
import strings from 'src/strings';
import { ServiceRequestType, SupportRequest } from 'src/types/Support';

export const requestListSupportRequestTypes = createAsyncThunk(
  'support/list',
  async (): Promise<ServiceRequestType[]> => {
    const response = await SupportService.listSupportRequestTypes();

    if (response !== null && response.requestSucceeded) {
      return response.types;
    }

    return [];
  }
);

export const requestSubmitSupportRequest = createAsyncThunk(
  'support/submit',
  async (request: SupportRequest, { rejectWithValue }) => {
    const response = await SupportService.submitSupportRequest(request);

    if (response !== null && response.requestSucceeded && response?.data?.issueKey !== undefined) {
      return response.data.issueKey;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
