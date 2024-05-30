import { createAsyncThunk } from '@reduxjs/toolkit';

import { SupportService } from 'src/services';
import strings from 'src/strings';
import { SupportRequest, SupportRequestType } from 'src/types/Support';

export const requestListSupportRequestTypes = createAsyncThunk(
  'support/list',
  async (): Promise<SupportRequestType[]> => {
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

export const requestUploadAttachment = createAsyncThunk(
  'support/uploadAttachment',
  async (file: File, { rejectWithValue }) => {
    const response = await SupportService.uploadSupportAttachment(file);

    if (response !== null && response.requestSucceeded && response?.data?.attachments !== undefined) {
      return response.data.attachments;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
