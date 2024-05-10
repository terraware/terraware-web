import { createAsyncThunk } from '@reduxjs/toolkit';

import ModuleService from 'src/services/ModuleService';
import strings from 'src/strings';

export const requestGetModule = createAsyncThunk(
  'modules/get',
  async ({ moduleId, projectId }: { moduleId: number; projectId: number }, { rejectWithValue }) => {
    const response = await ModuleService.get(projectId, moduleId);

    if (response !== null && response.requestSucceeded && response?.data?.module !== undefined) {
      return response.data.module;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListModules = createAsyncThunk('modules/list', async (projectId: number, { rejectWithValue }) => {
  const response = await ModuleService.list(projectId);

  if (response !== null && response.requestSucceeded && response?.data?.modules !== undefined) {
    return response.data.modules;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestListAllModules = createAsyncThunk(
  'modules/listAll',
  async (projectIds: number[], { rejectWithValue }) => {
    const results = await Promise.all(projectIds.map((projectId) => ModuleService.list(projectId)));

    const requestSucceeded = results.reduce(
      (prev, result) => prev && !!result && result.requestSucceeded && !!result.data,
      true
    );

    if (requestSucceeded) {
      return results.map((result, idx) => ({ id: projectIds[idx], modules: result.data?.modules }));
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
