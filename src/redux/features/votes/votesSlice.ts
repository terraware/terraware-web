import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestProjectVotesDelete,
  requestProjectVotesGet,
  requestProjectVotesUpdate,
} from 'src/redux/features/votes/votesAsyncThunks';
import { GetProjectVotesResponse, GetProjectVotesResponsePayload } from 'src/types/Votes';

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

type ProjectVotesResponsesUnion = GetProjectVotesResponse;
type VotingRequestsState = Record<string, StatusT<ProjectVotesResponsesUnion>>;

const initialVotingRequestsState: VotingRequestsState = {};

export const votesRequestsSlice = createSlice({
  name: 'votesRequestsSlice',
  initialState: initialVotingRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VotingRequestsState>) => {
    buildReducers(requestProjectVotesUpdate)(builder);
    buildReducers(requestProjectVotesDelete)(builder);
  },
});

export const votesRequestsReducer = votesRequestsSlice.reducer;
