import { ActionReducerMapBuilder, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestProjectVotesDelete, requestProjectVotesUpdate } from 'src/redux/features/voting/votingAsyncThunks';
import { ProjectVotesPayload, ProjectVotesResponsePayload } from 'src/types/Voting';

// Define a type for the slice state
type Data = {
  error?: string;
  votes?: ProjectVotesPayload;
};

// Define the initial state
const initialState: Data = {};

export const votingSlice = createSlice({
  name: 'votingSlice',
  initialState,
  reducers: {
    setProjectVotesAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.votes = data.votes;
    },
  },
});

export const { setProjectVotesAction } = votingSlice.actions;
export const votingReducer = votingSlice.reducer;

type ProjectVotesResponsesUnion = ProjectVotesResponsePayload;
type VotingRequestsState = Record<string, StatusT<ProjectVotesResponsesUnion>>;

const initialVotingRequestsState: VotingRequestsState = {};

export const votingRequestsSlice = createSlice({
  name: 'votingRequestsSlice',
  initialState: initialVotingRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VotingRequestsState>) => {
    buildReducers(requestProjectVotesUpdate)(builder);
    buildReducers(requestProjectVotesDelete)(builder);
  },
});

export const votingRequestsReducer = votingRequestsSlice.reducer;
