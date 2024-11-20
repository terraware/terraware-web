import { createAsyncThunk } from '@reduxjs/toolkit';

import CohortModuleService from 'src/services/CohortModuleService';
import { Response, Response2 } from 'src/services/HttpService';
import strings from 'src/strings';
import { UpdateCohortModuleRequest } from 'src/types/Module';

export const requestGetCohortModule = createAsyncThunk(
  'cohortModules/get',
  async (request: { cohortId: number; moduleId: number }, { rejectWithValue }) => {
    const response = await CohortModuleService.get(request.cohortId, request.moduleId);

    if (response !== null && response.requestSucceeded && response?.data?.module !== undefined) {
      return response.data.module;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListCohortModules = createAsyncThunk(
  'cohortModules/list',
  async (request: { cohortId: number }, { rejectWithValue }) => {
    const response = await CohortModuleService.list(request.cohortId);

    if (response !== null && response.requestSucceeded && response?.data?.modules !== undefined) {
      return response.data.modules;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteCohortModule = createAsyncThunk(
  'cohortModules/delete',
  async (
    request: {
      moduleId: number;
      cohortId: number;
    },
    { rejectWithValue }
  ) => {
    const { moduleId, cohortId } = request;
    const response: Response2<number> = await CohortModuleService.deleteOne(moduleId, cohortId);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteManyCohortModule = createAsyncThunk(
  'cohortModules/deleteMany',
  async (
    request: {
      moduleIds: number[];
      cohortId: number;
    },
    { rejectWithValue }
  ) => {
    const { moduleIds, cohortId } = request;

    const promises = moduleIds.map((moduleId) => CohortModuleService.deleteOne(moduleId, cohortId));

    const results = await Promise.all(promises);

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateCohortModule = createAsyncThunk(
  'cohortModules/update',
  async (
    {
      moduleId,
      cohortId,
      request,
    }: {
      moduleId: number;
      cohortId: number;
      request: UpdateCohortModuleRequest;
    },
    { rejectWithValue }
  ) => {
    const response: Response = await CohortModuleService.update({ moduleId, cohortId, entity: request });

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateManyCohortModule = createAsyncThunk(
  'cohortModules/updateMany',
  async (
    {
      cohortId,
      modules,
    }: {
      cohortId: number;
      modules: (UpdateCohortModuleRequest & {
        id: number;
      })[];
    },
    { rejectWithValue }
  ) => {
    const results = await Promise.all(
      modules.map((module) => {
        const { id, ...entity } = module;
        return CohortModuleService.update({ moduleId: id, cohortId, entity });
      })
    );

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
