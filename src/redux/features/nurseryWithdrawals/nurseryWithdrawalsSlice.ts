import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from '../asyncUtils';
import { SpeciesPlot, requestPlantingSiteWithdrawnSpecies } from './nurseryWithdrawalsThunks';

const initialStatePlantingSiteWithdrawnSpecies: { [key: string]: StatusT<SpeciesPlot[]> } = {};

export const plantingSiteWithdrawnSpeciesSlice = createSlice({
  name: 'plantingSiteWithdrawnSpeciesSlice',
  initialState: initialStatePlantingSiteWithdrawnSpecies,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteWithdrawnSpecies)(builder);
  },
});

const nurseryWithdrawalsReducers = {
  plantingSiteWithdrawnSpecies: plantingSiteWithdrawnSpeciesSlice.reducer,
};

export default nurseryWithdrawalsReducers;
