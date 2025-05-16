import { createSlice } from '@reduxjs/toolkit';

import { Species } from 'src/types/Species';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestGetOneSpecies,
  requestListInUseSpecies,
  requestListSpecies,
  requestUpdateSpecies,
} from './speciesAsyncThunks';
import { MergeOtherSpeciesRequestData, requestMergeOtherSpecies } from './speciesThunks';

/**
 * Get Single Species
 */
const initialStateSpeciesGetOne: { [key: string]: StatusT<Species> } = {};

export const speciesGetOneSlice = createSlice({
  name: 'speciesGetOneSlice',
  initialState: initialStateSpeciesGetOne,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetOneSpecies)(builder);
  },
});

/**
 * List Species
 */
const initialStateSpeciesList: { [key: string]: StatusT<Species[]> } = {};

export const speciesListSlice = createSlice({
  name: 'speciesListSlice',
  initialState: initialStateSpeciesList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListSpecies, true)(builder);
  },
});

export const speciesInUseListSlice = createSlice({
  name: 'speciesInUseListSlice',
  initialState: initialStateSpeciesList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListInUseSpecies, true)(builder);
  },
});

/**
 * Update Species
 */
const initialStateSpeciesUpdate: { [key: string]: StatusT<boolean> } = {};

export const speciesUpdateSlice = createSlice({
  name: 'speciesUpdateSlice',
  initialState: initialStateSpeciesUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateSpecies)(builder);
  },
});

/**
 * Merge other species
 */
const initialStateMergeOtherSpecies: { [key: string]: StatusT<MergeOtherSpeciesRequestData[]> } = {};

export const mergeOtherSpeciesSlice = createSlice({
  name: 'mergeOtherSpeciesSlice',
  initialState: initialStateMergeOtherSpecies,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestMergeOtherSpecies)(builder);
  },
});

const speciesAsyncThunkReducers = {
  speciesGetOne: speciesGetOneSlice.reducer,
  speciesList: speciesListSlice.reducer,
  speciesInUseList: speciesInUseListSlice.reducer,
  speciesUpdate: speciesUpdateSlice.reducer,
  mergeOtherSpecies: mergeOtherSpeciesSlice.reducer,
};

export default speciesAsyncThunkReducers;
