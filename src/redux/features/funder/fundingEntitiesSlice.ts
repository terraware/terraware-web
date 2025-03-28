import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { InviteFunderResponse } from 'src/services/FundingEntityService';
import { Funder, FundingEntity } from 'src/types/FundingEntity';

import {
  requestCreateFundingEntity,
  requestFundingEntities,
  requestFundingEntity,
  requestFundingEntityForUser,
  requestFundingEntityInviteFunder,
  requestListFunders,
  requestUpdateFundingEntity,
} from './fundingEntitiesAsyncThunks';

const initialStateUserFundingEntity: { [key: string]: StatusT<{ userFundingEntity: FundingEntity }> } = {};

const initialStateFundingEntity: { [key: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

const initialStateFundingEntities: { [key: string]: StatusT<{ fundingEntities: FundingEntity[] }> } = {};

const initialStateFundingEntityUpdate: { [requestId: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

const initialStateFundingEntityCreate: { [requestId: string]: StatusT<{ fundingEntity: FundingEntity }> } = {};

const initialStateFundingEntityInvite: { [requestId: string]: StatusT<string | InviteFunderResponse> } = {};

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

export const fundingEntityCreateSlice = createSlice({
  name: 'fundingEntityCreateSlice',
  initialState: initialStateFundingEntityCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateFundingEntity, true)(builder);
  },
});

export const fundingEntityInviteSlice = createSlice({
  name: 'fundingEntityInviteSlice',
  initialState: initialStateFundingEntityInvite,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestFundingEntityInviteFunder, true)(builder);
  },
});

const initialStateFunderList: { [requestId: string]: StatusT<Funder[]> } = {};

export const funderListSlice = createSlice({
  name: 'funderListSlice',
  initialState: initialStateFunderList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListFunders, true)(builder);
  },
});

const fundingEntitiesReducers = {
  userFundingEntity: userFundingEntitySlice.reducer,
  fundingEntity: fundingEntitySlice.reducer,
  fundingEntities: fundingEntitiesSlice.reducer,
  fundingEntityUpdate: fundingEntityUpdateSlice.reducer,
  fundingEntityCreate: fundingEntityCreateSlice.reducer,
  fundingEntityInvite: fundingEntityInviteSlice.reducer,
  funders: funderListSlice.reducer,
};

export default fundingEntitiesReducers;
