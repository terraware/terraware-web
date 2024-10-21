import { createSlice } from '@reduxjs/toolkit';

import { ListDeliverablesElement } from 'src/types/Deliverables';
import { Module, ModuleCohortsAndProjectsSearchResult, ModuleSearchResult } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestDeleteCohortModule,
  requestDeleteManyCohortModule,
  requestGetModule,
  requestListModuleCohortsAndProjects,
  requestListModuleDeliverables,
  requestListModuleProjects,
  requestListModules,
  requestSearchModules,
  requestUpdateCohortModule,
  requestUpdateManyCohortModule,
} from './modulesAsyncThunks';

/**
 * Get Module
 */
const initialStateModule: { [key: string]: StatusT<Module> } = {};

export const moduleSlice = createSlice({
  name: 'moduleSlice',
  initialState: initialStateModule,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetModule)(builder);
  },
});

/**
 * List Modules
 */
const initialStateModuleList: { [key: string]: StatusT<Module[]> } = {};

export const moduleListSlice = createSlice({
  name: 'moduleListSlice',
  initialState: initialStateModuleList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListModules)(builder);
  },
});

/**
 * List projects with modules in an organization
 */
const initialStateModuleProjects: { [key: string]: StatusT<number[]> } = {};

export const moduleProjectsSlice = createSlice({
  name: 'moduleProjectsSlice',
  initialState: initialStateModuleProjects,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListModuleProjects)(builder);
  },
});

/**
 * List module deliverables for a project module pair
 */
const initialStateModuleDeliverables: { [key: string]: StatusT<ListDeliverablesElement[]> } = {};

export const ModuleDeliverablesSlice = createSlice({
  name: 'ModuleDeliverablesSlice',
  initialState: initialStateModuleDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListModuleDeliverables)(builder);
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

/**
 * List all projects and cohorts associated with a module
 */
const initialStateModuleCohortsAndProjects: { [key: string]: StatusT<ModuleCohortsAndProjectsSearchResult> } = {};

export const moduleCohortsAndProjectsSlice = createSlice({
  name: 'moduleCohortsAndProjectsSlice',
  initialState: initialStateModuleCohortsAndProjects,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListModuleCohortsAndProjects, true)(builder);
  },
});

/**
 * Search modules
 */
const initialStateSearchModules: { [key: string]: StatusT<ModuleSearchResult[]> } = {};

export const searchModulesSlice = createSlice({
  name: 'searchModulesSlice',
  initialState: initialStateSearchModules,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSearchModules)(builder);
  },
});

const moduleReducers = {
  module: moduleSlice.reducer,
  moduleDeliverables: ModuleDeliverablesSlice.reducer,
  moduleList: moduleListSlice.reducer,
  moduleProjects: moduleProjectsSlice.reducer,
  cohortModuleDelete: cohortModuleDeleteSlice.reducer,
  cohortModuleUpdate: cohortModuleUpdateSlice.reducer,
  cohortModuleDeleteMany: cohortModuleDeleteManySlice.reducer,
  cohortModuleUpdateMany: cohortModuleUpdateManySlice.reducer,
  moduleCohortsAndProjects: moduleCohortsAndProjectsSlice.reducer,
  searchModules: searchModulesSlice.reducer,
};

export default moduleReducers;
