import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { FundingEntity } from 'src/types/FundingEntity';

import { requestFundingEntities, requestFundingEntity } from './fundingEntitiesAsyncThunks';

const initialStateFundingEntity: { [key: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

const initialStateFundingEntities: { [key: string]: StatusT<{ fundingEntities: FundingEntity[] }> } = {};

export const fundingEntitySlice = createSlice({
  name: 'fundingEntitySlice',
  initialState: initialStateFundingEntity,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestFundingEntity, true)(builder);
  },
});

export const fundingEntitiesSlice = createSlice({
  name: 'fundingEntitiesSlice',
  initialState: initialStateFundingEntities,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestFundingEntities, true)(builder);
  },
});

const fundingEntitiesReducers = {
  fundingEntity: fundingEntitySlice.reducer,
  fundingEntities: fundingEntitiesSlice.reducer,
};

export default fundingEntitiesReducers;
