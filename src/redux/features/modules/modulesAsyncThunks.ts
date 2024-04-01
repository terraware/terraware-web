import { createAsyncThunk } from '@reduxjs/toolkit';

import ModuleService from 'src/services/ModuleService';
import strings from 'src/strings';

export const requestGetModule = createAsyncThunk('modules/get', async (moduleId: number, { rejectWithValue }) => {
  const response = await ModuleService.get(moduleId);

  if (response !== null && response.requestSucceeded && response?.data?.module !== undefined) {
    return response.data.module;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestListModules = createAsyncThunk('modules/list', async (projectId: number, { rejectWithValue }) => {
  const response = await ModuleService.list(projectId);

  if (response !== null && response.requestSucceeded && response?.data?.modules !== undefined) {
    return response.data.modules;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});
