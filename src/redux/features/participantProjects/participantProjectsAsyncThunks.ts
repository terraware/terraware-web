import { createAsyncThunk } from '@reduxjs/toolkit';

import ParticipantProjectService from 'src/services/ParticipantProjectService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export type ListRequest = {
  locale?: string;
  search?: SearchNodePayload;
  sortOrder?: SearchSortOrder;
};

export const requestListParticipantProjects = createAsyncThunk(
  'participantProjects/list',
  async ({ locale, search, sortOrder }: ListRequest, { rejectWithValue }) => {
    const response = await ParticipantProjectService.list(locale, search, sortOrder);

    if (response && response.status === 'ok') {
      return response.details;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
