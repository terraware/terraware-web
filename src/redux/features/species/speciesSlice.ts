import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Species } from 'src/types/Species';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetOneSpecies, requestListSpecies, requestUpdateSpecies } from './speciesAsyncThunks';
import { MergeOtherSpeciesRequestData, requestMergeOtherSpecies } from './speciesThunks';

// Define a type for the slice state
export type SpeciesSliceData = {
  error?: string;
  species?: Species[];
  organizationId?: number;
};

// Define the initial state
const initialState: { [key: string]: StatusT<SpeciesSliceData> } & SpeciesSliceData = {};

export const speciesSlice = createSlice({
  name: 'speciesSlice',
  initialState,
  reducers: {
    setSpeciesAction: (state, action: PayloadAction<SpeciesSliceData>) => {
      const data: SpeciesSliceData = action.payload;
      state.error = data.error;
      state.species = data.species;
      state.organizationId = data.organizationId;
      if (data.organizationId) {
        state[data.organizationId.toString()] = {
          status: 'success',
          data,
        };
      }
    },
  },
});

export const { setSpeciesAction } = speciesSlice.actions;

export const speciesReducer = speciesSlice.reducer;

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
    buildReducers(requestListSpecies)(builder);
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
  speciesUpdate: speciesUpdateSlice.reducer,
  mergeOtherSpecies: mergeOtherSpeciesSlice.reducer,
};

export default speciesAsyncThunkReducers;
