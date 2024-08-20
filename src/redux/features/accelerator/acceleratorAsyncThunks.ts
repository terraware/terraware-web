import { createAsyncThunk } from '@reduxjs/toolkit';

import AcceleratorService, { AcceleratorOrgData } from 'src/services/AcceleratorService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestAcceleratorOrgs = createAsyncThunk(
  'acceleratorOrgs/list',
  async (
    request: {
      locale: string | null;
      includeParticipants?: boolean;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { locale, includeParticipants, search, searchSortOrder } = request;

    const response: Response & AcceleratorOrgData = await AcceleratorService.listAcceleratorOrgs(
      locale,
      includeParticipants,
      search,
      searchSortOrder
    );

    if (response && response.requestSucceeded) {
      return response.organizations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
