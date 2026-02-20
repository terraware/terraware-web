import { createSlice } from '@reduxjs/toolkit';

import { Module, ModuleProjectsSearchResult, ModuleSearchResult } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestGetModule,
  requestListModuleProjects,
  requestListModules,
  requestListOrgProjectsAndModules,
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
const initialStateModuleOrgProjects: { [key: string]: StatusT<number[]> } = {};

export const moduleOrgProjectsSlice = createSlice({
  name: 'moduleOrgProjectsSlice',
  initialState: initialStateModuleOrgProjects,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListOrgProjectsAndModules)(builder);
  },
});

/**
 * List all projects associated with a module
 */
const initialStateModuleProjects: { [key: string]: StatusT<ModuleProjectsSearchResult> } = {};

export const moduleProjectsSlice = createSlice({
  name: 'moduleProjectsSlice',
  initialState: initialStateModuleProjects,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListModuleProjects, true)(builder);
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
  moduleOrgProjects: moduleOrgProjectsSlice.reducer,
  moduleProjects: moduleProjectsSlice.reducer,
  searchModules: searchModulesSlice.reducer,
};

export default moduleReducers;
