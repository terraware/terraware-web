import { createSlice } from '@reduxjs/toolkit';

import { CohortModule } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestDeleteCohortModule,
  requestDeleteManyCohortModule,
  requestGetCohortModule,
  requestListCohortModules,
  requestUpdateCohortModule,
  requestUpdateManyCohortModule,
} from './cohortModulesAsyncThunks';

/**
 * Get Cohort Module
 */
const initialStateCohortModule: { [key: string]: StatusT<CohortModule> } = {};

export const cohortModuleSlice = createSlice({
  name: 'cohortModuleSlice',
  initialState: initialStateCohortModule,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetCohortModule)(builder);
  },
});

/**
 * List Cohort Modules
 */
const initialStateCohortModuleList: { [key: string]: StatusT<CohortModule[]> } = {};

export const cohortModuleListSlice = createSlice({
  name: 'cohortModuleListSlice',
  initialState: initialStateCohortModuleList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListCohortModules)(builder);
  },
});

/**
 * Deletes a cohort module
 */
const initialStateCohortModuleDelete: { [key: string]: StatusT<boolean> } = {};

export const cohortModuleDeleteSlice = createSlice({
  name: 'cohortModuleDeleteSlice',
  initialState: initialStateCohortModuleDelete,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteCohortModule)(builder);
  },
});

/**
 * Updates a cohort module
 */
const initialStateCohortModuleUpdate: { [key: string]: StatusT<boolean> } = {};

export const cohortModuleUpdateSlice = createSlice({
  name: 'cohortModuleUpdateSlice',
  initialState: initialStateCohortModuleUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateCohortModule)(builder);
  },
});

/**
 * Deletes many cohort modules
 */
const initialStateCohortModuleDeleteMany: { [key: string]: StatusT<boolean> } = {};

export const cohortModuleDeleteManySlice = createSlice({
  name: 'cohortModuleDeleteManySlice',
  initialState: initialStateCohortModuleDeleteMany,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteManyCohortModule)(builder);
  },
});

/**
 * Updates a cohort module
 */
const initialStateCohortModuleUpdateMany: { [key: string]: StatusT<boolean> } = {};

export const cohortModuleUpdateManySlice = createSlice({
  name: 'cohortModuleUpdateManySlice',
  initialState: initialStateCohortModuleUpdateMany,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateManyCohortModule)(builder);
  },
});

const cohortModuleReducers = {
  cohortModule: cohortModuleSlice.reducer,
  cohortModuleList: cohortModuleListSlice.reducer,
  cohortModuleDelete: cohortModuleDeleteSlice.reducer,
  cohortModuleUpdate: cohortModuleUpdateSlice.reducer,
  cohortModuleDeleteMany: cohortModuleDeleteManySlice.reducer,
  cohortModuleUpdateMany: cohortModuleUpdateManySlice.reducer,
};

export default cohortModuleReducers;
