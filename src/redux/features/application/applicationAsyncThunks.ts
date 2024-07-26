import { createAsyncThunk } from '@reduxjs/toolkit';

import ApplicationService from 'src/services/ApplicationService';
import strings from 'src/strings';

export const requestListApplications = createAsyncThunk(
  'applications/list',
  async (request: { organizationId: number }, { rejectWithValue }) => {
    const { organizationId } = request;

    const response = await ApplicationService.listApplications(organizationId);

    if (response && response.requestSucceeded) {
      return response.data?.applications ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListApplicationDeliverables = createAsyncThunk(
  'applications/listDeliverables',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.listApplicationDeliverables(applicationId);

    if (response && response.requestSucceeded) {
      return response.data?.deliverables ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListApplicationModules = createAsyncThunk(
  'applications/listModules',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.listApplicationModules(applicationId);

    if (response && response.requestSucceeded) {
      return response.data?.modules ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
