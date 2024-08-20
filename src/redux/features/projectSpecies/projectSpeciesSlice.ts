import { createSlice } from '@reduxjs/toolkit';

import { SpeciesDeliverable } from 'src/types/ProjectSpecies';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestSpeciesDeliverables } from './projectSpeciesAsyncThunks';

/**
 * Get Module
 */
const initialStateSpeciesDeliverables: { [key: string]: StatusT<SpeciesDeliverable[]> } = {};

export const speciesDeliverablesSlice = createSlice({
  name: 'speciesDeliverablesSlice',
  initialState: initialStateSpeciesDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSpeciesDeliverables)(builder);
  },
});

const projectSpeciesReducers = {
  speciesDeliverables: speciesDeliverablesSlice.reducer,
};

export default projectSpeciesReducers;
