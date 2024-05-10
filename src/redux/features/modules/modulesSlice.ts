import { createSlice } from '@reduxjs/toolkit';

import { Module } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetModule, requestListModuleProjects, requestListModules } from './modulesAsyncThunks';

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

const moduleReducers = {
  module: moduleSlice.reducer,
  moduleList: moduleListSlice.reducer,
  moduleProjects: moduleProjectsSlice.reducer,
};

export default moduleReducers;
