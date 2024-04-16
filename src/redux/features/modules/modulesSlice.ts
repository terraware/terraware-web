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

export const moduleReducer = moduleSlice.reducer;

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

export const moduleEventReducer = moduleEventSlice.reducer;

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

export const moduleListReducer = moduleListSlice.reducer;
