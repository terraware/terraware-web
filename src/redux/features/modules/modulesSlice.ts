import { createSlice } from '@reduxjs/toolkit';

import { Module, ModuleCohortsSearchResult, ModuleSearchResult } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestGetModule,
  requestListModuleCohorts,
  requestListModuleProjects,
  requestListModules,
  requestSearchModules,
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
 * List all cohorts associated with a module
 */
const initialStateModuleCohorts: { [key: string]: StatusT<ModuleCohortsSearchResult> } = {};

export const moduleCohortsSlice = createSlice({
  name: 'moduleCohortsSlice',
  initialState: initialStateModuleCohorts,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListModuleCohorts, true)(builder);
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
  moduleList: moduleListSlice.reducer,
  moduleProjects: moduleProjectsSlice.reducer,
  moduleCohorts: moduleCohortsSlice.reducer,
  searchModules: searchModulesSlice.reducer,
};

export default moduleReducers;
