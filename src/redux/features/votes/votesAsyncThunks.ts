import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response, Response2 } from 'src/services/HttpService';
import VotesService from 'src/services/VotesService';
import strings from 'src/strings';
import { GetProjectVotesResponsePayload, UpsertProjectVotesRequestPayload } from 'src/types/Votes';

export const requestProjectVotesGet = createAsyncThunk('votes/get', async (projectId: number, { rejectWithValue }) => {
  const response: Response2<GetProjectVotesResponsePayload> = await VotesService.getProjectVotes(projectId);

  if (response.requestSucceeded) {
    return response.data?.votes;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestProjectVotesUpdate = createAsyncThunk(
  'votes/update',
  async (request: { projectId: number; payload: UpsertProjectVotesRequestPayload }, { dispatch, rejectWithValue }) => {
    const response: Response = await VotesService.setProjectVotes(request.projectId, request.payload);

    if (response.requestSucceeded) {
      dispatch(requestProjectVotesGet(request.projectId));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
