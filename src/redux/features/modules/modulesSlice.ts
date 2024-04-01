import { createSlice } from '@reduxjs/toolkit';

import { Module } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetModule, requestListModules } from './modulesAsyncThunks';

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

export const moduleListReducer = moduleSlice.reducer;
