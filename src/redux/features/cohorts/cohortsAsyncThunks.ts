import { createAsyncThunk } from '@reduxjs/toolkit';

import { setCohortAction, setCohortModulesAction, setCohortsAction } from 'src/redux/features/cohorts/cohortsSlice';
import CohortService, {
  CreateCohortResponsePayload,
  DeleteCohortResponsePayload,
  ListCohortsRequestDepth,
  UpdateCohortResponsePayload,
} from 'src/services/CohortService';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';
import { Cohort, CreateCohortRequestPayload, MockModule, UpdateCohortRequestPayload } from 'src/types/Cohort';

export const requestCohorts = createAsyncThunk(
  'cohorts/list',
  async (request: { locale: string | null; depth?: ListCohortsRequestDepth }, { dispatch, rejectWithValue }) => {
    const response: Response2<Cohort[]> = await CohortService.listCohorts(request.locale, request.depth);

    if (response !== null && response.requestSucceeded && response?.data !== undefined) {
      dispatch(setCohortsAction({ error: response.error, cohorts: response.data }));
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCohort = createAsyncThunk(
  'cohorts/get',
  async (request: { cohortId: number }, { dispatch, rejectWithValue }) => {
    const response: Response2<Cohort> = await CohortService.getCohort(request.cohortId);

    if (response !== null && response.requestSucceeded && response.data !== undefined) {
      dispatch(setCohortAction({ error: response.error, cohorts: [response.data] }));
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCohortModules = createAsyncThunk(
  'cohorts/modules',
  async (request: { cohortId: number }, { dispatch, rejectWithValue }) => {
    const response: Response2<MockModule[]> = await CohortService.listCohortModules(request.cohortId);

    if (response !== null && response.requestSucceeded && response.data !== undefined) {
      dispatch(setCohortModulesAction({ cohortId: request.cohortId, error: response.error, modules: response.data }));
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCohortCreate = createAsyncThunk(
  'cohorts/create',
  async (request: { cohort: CreateCohortRequestPayload }, { rejectWithValue }) => {
    const response: Response2<CreateCohortResponsePayload> = await CohortService.createCohort(request.cohort);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCohortUpdate = createAsyncThunk(
  'cohorts/update',
  async (request: { cohortId: number; cohort: UpdateCohortRequestPayload }, { rejectWithValue }) => {
    const response: Response2<UpdateCohortResponsePayload> = await CohortService.updateCohort(
      request.cohortId,
      request.cohort
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCohortDelete = createAsyncThunk(
  'cohorts/delete',
  async (request: { cohortId: number }, { rejectWithValue }) => {
    const response: Response2<DeleteCohortResponsePayload> = await CohortService.deleteCohort(request.cohortId);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
