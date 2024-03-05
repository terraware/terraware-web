import { ActionReducerMapBuilder, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestCohortDelete, requestCohortUpdate } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { UpdateCohortResponsePayload } from 'src/services/CohortService';
import { Cohort, MockCohortModule } from 'src/types/Cohort';

// Define a type for the slice state
type Data = {
  error?: string;
  cohorts?: Cohort[];
};

// Define the initial state
const initialState: Data = {};

export const cohortsSlice = createSlice({
  name: 'cohortsSlice',
  initialState,
  reducers: {
    setCohortsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.cohorts = data.cohorts;
    },
    setCohortAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      const payloadCohorts = data.cohorts || [];
      state.error = data.error;
      state.cohorts = [
        // Filter out the newly fetched cohort from state, if it exists
        ...(state.cohorts || []).filter((cohort) => !payloadCohorts.map((_cohort) => _cohort.id).includes(cohort.id)),
        ...payloadCohorts,
      ];
    },
  },
});

export const { setCohortsAction, setCohortAction } = cohortsSlice.actions;
export const cohortsReducer = cohortsSlice.reducer;

type CohortsResponsesUnion = UpdateCohortResponsePayload;
type CohortsRequestsState = Record<string, StatusT<CohortsResponsesUnion>>;

const initialCohortsRequestsState: CohortsRequestsState = {};

export const cohortsRequestsSlice = createSlice({
  name: 'cohortsRequestsSlice',
  initialState: initialCohortsRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<CohortsRequestsState>) => {
    buildReducers(requestCohortUpdate)(builder);
    buildReducers(requestCohortDelete)(builder);
  },
});

export const cohortsRequestsReducer = cohortsRequestsSlice.reducer;

/**
 * Cohort modules list
 */

type CohortId = number;

// Define a type for the slice state
type CohortModulesState = Record<CohortId, MockCohortModule[]>;

type CohortModulesData = {
  cohortId: CohortId;
  error?: string;
  modules?: MockCohortModule[];
};

const initialCohortModulesState: CohortModulesState = {};

export const cohortModulesSlice = createSlice({
  name: 'cohortModulesSlice',
  initialState: initialCohortModulesState,
  reducers: {
    setCohortModulesAction: (state, action: PayloadAction<CohortModulesData>) => {
      if (action.payload.cohortId && action.payload.modules) {
        state[action.payload.cohortId] = action.payload.modules;
      }
    },
  },
});

export const { setCohortModulesAction } = cohortModulesSlice.actions;
export const cohortModulesReducer = cohortModulesSlice.reducer;
