import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from '../asyncUtils';
import { MergeOtherSpeciesRequestData, requestMergeOtherSpecies } from './speciesThunks';

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
  mergeOtherSpecies: mergeOtherSpeciesSlice.reducer,
};

export default speciesAsyncThunkReducers;
