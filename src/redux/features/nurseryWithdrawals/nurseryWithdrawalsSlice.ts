import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { NurseryWithdrawalsSearchResponseElement } from 'src/services/NurseryWithdrawalService';
import { FieldOptionsMap } from 'src/types/Search';

import {
  SpeciesPlot,
  requestCountNurseryWithdrawals,
  requestListNurseryWithdrawals,
  requestNurseryWithdrawalsFilterOptions,
  requestPlantingSiteWithdrawnSpecies,
} from './nurseryWithdrawalsThunks';

const initialStatePlantingSiteWithdrawnSpecies: { [key: string]: StatusT<SpeciesPlot[]> } = {};

export const plantingSiteWithdrawnSpeciesSlice = createSlice({
  name: 'plantingSiteWithdrawnSpeciesSlice',
  initialState: initialStatePlantingSiteWithdrawnSpecies,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteWithdrawnSpecies)(builder);
  },
});

const initialStateNurseryWithdrawalsList: { [key: string]: StatusT<NurseryWithdrawalsSearchResponseElement[]> } = {};

export const nurseryWithdrawalsListSlice = createSlice({
  name: 'nurseryWithdrawalsListSlice',
  initialState: initialStateNurseryWithdrawalsList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListNurseryWithdrawals)(builder);
  },
});

const initialStateNurseryWithdrawalsFilterOptions: { [key: string]: StatusT<FieldOptionsMap> } = {};

export const nurseryWithdrawalsFilterOptionsSlice = createSlice({
  name: 'nurseryWithdrawalsFilterOptionsSlice',
  initialState: initialStateNurseryWithdrawalsFilterOptions,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestNurseryWithdrawalsFilterOptions)(builder);
  },
});

const initialStateNurseryWithdrawalsCount: { [key: string]: StatusT<number> } = {};

export const nurseryWithdrawalsCountSlice = createSlice({
  name: 'nurseryWithdrawalsCountSlice',
  initialState: initialStateNurseryWithdrawalsCount,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCountNurseryWithdrawals)(builder);
  },
});

const nurseryWithdrawalsReducers = {
  plantingSiteWithdrawnSpecies: plantingSiteWithdrawnSpeciesSlice.reducer,
  nurseryWithdrawalsList: nurseryWithdrawalsListSlice.reducer,
  nurseryWithdrawalsFilterOptions: nurseryWithdrawalsFilterOptionsSlice.reducer,
  nurseryWithdrawalsCount: nurseryWithdrawalsCountSlice.reducer,
};

export default nurseryWithdrawalsReducers;
