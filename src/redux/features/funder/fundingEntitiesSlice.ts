import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { FundingEntity } from 'src/types/FundingEntity';

import {
  requestFundingEntities,
  requestFundingEntity,
  requestFundingEntityForUser,
  requestUpdateFundingEntity,
} from './fundingEntitiesAsyncThunks';

const initialStateUserFundingEntity: { [key: string]: StatusT<{ userFundingEntity: FundingEntity }> } = {};

const initialStateFundingEntity: { [key: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

const initialStateFundingEntities: { [key: string]: StatusT<{ fundingEntities: FundingEntity[] }> } = {};

const initialStateFundingEntityUpdate: { [requestId: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

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

export const userFundingEntitySlice = createSlice({
  name: 'userFundingEntitySlice',
  initialState: initialStateUserFundingEntity,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestFundingEntityForUser, true)(builder);
  },
});

export const fundingEntityUpdateSlice = createSlice({
  name: 'fundingEntityUpdateSlice',
  initialState: initialStateFundingEntityUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateFundingEntity, true)(builder);
  },
});

const fundingEntitiesReducers = {
  userFundingEntity: userFundingEntitySlice.reducer,
  fundingEntity: fundingEntitySlice.reducer,
  fundingEntities: fundingEntitiesSlice.reducer,
  fundingEntityUpdate: fundingEntityUpdateSlice.reducer,
};

export default fundingEntitiesReducers;
