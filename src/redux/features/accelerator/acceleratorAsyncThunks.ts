import { createAsyncThunk } from '@reduxjs/toolkit';

import AcceleratorService, { AcceleratorOrgData } from 'src/services/AcceleratorService';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';

export const requestAcceleratorOrgs = createAsyncThunk(
  'acceleratorOrgs/list',
  async (request: { locale?: string | null }, { rejectWithValue }) => {
    const { locale } = request;

    const response: Response2<AcceleratorOrgData> = await AcceleratorService.listAcceleratorOrgs(locale);

    if (response && response.requestSucceeded) {
      return response.data?.orgs;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
