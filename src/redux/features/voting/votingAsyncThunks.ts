import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import VotingService from 'src/services/VotingService';
import strings from 'src/strings';
import {
  DeleteProjectVotesRequestPayload,
  DeleteProjectVotesResponsePayload,
  ProjectVotesResponsePayload,
  UpsertVoteSelection,
} from 'src/types/Voting';

export const requestProjectVotesUpdate = createAsyncThunk(
  'voting/update',
  async (request: { projectId: number; payload: UpsertVoteSelection }, { rejectWithValue }) => {
    const response: Response2<ProjectVotesResponsePayload> = await VotingService.setProjectVotes(
      request.projectId,
      request.payload
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectVotesDelete = createAsyncThunk(
  'voting/delete',
  async (request: { projectId: number; payload: DeleteProjectVotesRequestPayload }, { rejectWithValue }) => {
    const response: Response2<DeleteProjectVotesResponsePayload> = await VotingService.deleteProjectVotes(
      request.projectId,
      request.payload
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
