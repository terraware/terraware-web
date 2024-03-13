import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestProjectVotesGet, requestProjectVotesUpdate } from 'src/redux/features/votes/votesAsyncThunks';
import { GetProjectVotesResponsePayload } from 'src/types/Votes';

// Define a type for the slice state
type Data = Record<number, StatusT<GetProjectVotesResponsePayload>>;

// Define the initial state
const initialState: Data = {};

export const votesSlice = createSlice({
  name: 'votesSlice',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<Data>) => {
    buildReducers(requestProjectVotesGet, true)(builder);
  },
});

export const votesReducer = votesSlice.reducer;

type VotingEditRequestsState = Record<string, StatusT<boolean>>;

const initialVotingEditRequestsState: VotingEditRequestsState = {};

export const votesRequestsSlice = createSlice({
  name: 'votesRequestsSlice',
  initialState: initialVotingEditRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VotingEditRequestsState>) => {
    buildReducers(requestProjectVotesUpdate)(builder);
  },
});

export const votesRequestsReducer = votesRequestsSlice.reducer;
