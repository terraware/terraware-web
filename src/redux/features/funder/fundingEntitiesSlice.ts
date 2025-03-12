import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { FundingEntity } from 'src/types/FundingEntity';

import { requestFundingEntity } from './fundingEntitiesAsyncThunks';

const initialStateFundingEntities: { [key: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

export const fundingEntitiesSlice = createSlice({
  name: 'fundingEntitiesSlice',
  initialState: initialStateFundingEntities,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestFundingEntity, true)(builder);
  },
});

const fundingEntitiesReducers = {
  fundingEntities: fundingEntitiesSlice.reducer,
};

export default fundingEntitiesReducers;
