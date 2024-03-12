import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import VotesService from 'src/services/VotesService';
import strings from 'src/strings';
import {
  DeleteProjectVotesRequestPayload,
  DeleteProjectVotesResponsePayload,
  ProjectVotesResponsePayload,
  UpsertVoteSelection,
} from 'src/types/Votes';

export const requestProjectVotesUpdate = createAsyncThunk(
  'votes/update',
  async (request: { projectId: number; payload: UpsertVoteSelection }, { rejectWithValue }) => {
    const response: Response2<ProjectVotesResponsePayload> = await VotesService.setProjectVotes(
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
  'votes/delete',
  async (request: { projectId: number; payload: DeleteProjectVotesRequestPayload }, { rejectWithValue }) => {
    const response: Response2<DeleteProjectVotesResponsePayload> = await VotesService.deleteProjectVotes(
      request.projectId,
      request.payload
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
