import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import VotesService from 'src/services/VotesService';
import strings from 'src/strings';
import {
  DeleteProjectVotesRequestPayload,
  DeleteProjectVotesResponsePayload,
  UpsertProjectVotesRequestPayload,
  UpsertProjectVotesResponsePayload,
} from 'src/types/Votes';

export const requestProjectVotesUpdate = createAsyncThunk(
  'votes/update',
  async (request: { projectId: number; payload: UpsertProjectVotesRequestPayload }, { rejectWithValue }) => {
    const response: Response2<UpsertProjectVotesResponsePayload> = await VotesService.setProjectVotes(
      request.projectId,
      request.payload
    );

    if (response.requestSucceeded) {
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

    if (response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
