import { createAsyncThunk } from '@reduxjs/toolkit';

import AcceleratorService, { AcceleratorOrgData } from 'src/services/AcceleratorService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';

export const requestAcceleratorOrgs = createAsyncThunk(
  'acceleratorOrgs/list',
  async (request: { locale?: string | null; includeParticipants?: boolean }, { rejectWithValue }) => {
    const { locale, includeParticipants } = request;

    const response: Response & AcceleratorOrgData = await AcceleratorService.listAcceleratorOrgs(
      locale,
      includeParticipants
    );

    if (response && response.requestSucceeded) {
      return response.organizations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
