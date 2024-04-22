import { createSlice } from '@reduxjs/toolkit';

import { Module, ModuleEvent } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetModule, requestGetModuleEvent, requestListModules } from './modulesAsyncThunks';

/**
 * Get Module
 */
const initialStateModule: { [key: string]: StatusT<Module> } = {};

export const moduleSlice = createSlice({
  name: 'moduleSlice',
  initialState: initialStateModule,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetModule, true)(builder);
  },
});

/**
 * Get Module Event
 */

const initialStateModuleEvent: { [key: string]: StatusT<ModuleEvent> } = {};

export const moduleEventSlice = createSlice({
  name: 'moduleEventSlice',
  initialState: initialStateModuleEvent,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetModuleEvent, true)(builder);
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
    buildReducers(requestListModules, true)(builder);
  },
});

const moduleReducers = {
  module: moduleSlice.reducer,
  moduleEvent: moduleEventSlice.reducer,
  moduleList: moduleListSlice.reducer,
};

export default moduleReducers;
