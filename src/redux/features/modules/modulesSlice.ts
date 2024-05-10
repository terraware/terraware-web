import { createSlice } from '@reduxjs/toolkit';

import { Module } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetModule, requestListAllModules, requestListModules } from './modulesAsyncThunks';

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
 * List Modules
 */
const initialStateAllModuleList: { [key: string]: StatusT<{ id: number; modules: Module[] }[]> } = {};

export const allModuleListSlice = createSlice({
  name: 'allModuleListSlice',
  initialState: initialStateAllModuleList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListAllModules)(builder);
  },
});

const moduleReducers = {
  module: moduleSlice.reducer,
  moduleList: moduleListSlice.reducer,
  allModuleList: allModuleListSlice.reducer,
};

export default moduleReducers;
