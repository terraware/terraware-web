import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Species } from 'src/types/Species';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetOneSpecies, requestUpdateSpecies } from './speciesAsyncThunks';
import { MergeOtherSpeciesRequestData, requestMergeOtherSpecies } from './speciesThunks';

// Define a type for the slice state
type Data = {
  error?: string;
  species?: Species[];
};

// Define the initial state
const initialState: Data = {};

export const speciesSlice = createSlice({
  name: 'speciesSlice',
  initialState,
  reducers: {
    setSpeciesAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.species = data.species;
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
  speciesUpdate: speciesUpdateSlice.reducer,
  mergeOtherSpecies: mergeOtherSpeciesSlice.reducer,
};

export default speciesAsyncThunkReducers;
