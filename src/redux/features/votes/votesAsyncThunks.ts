import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response, Response2 } from 'src/services/HttpService';
import VotesService from 'src/services/VotesService';
import strings from 'src/strings';
import { UpsertProjectVotesRequestPayload, VotingRecordsData } from 'src/types/Votes';

export const requestProjectVotesGet = createAsyncThunk('votes/get', async (projectId: number, { rejectWithValue }) => {
  const response: Response2<VotingRecordsData> = await VotesService.getProjectVotes(projectId);

  if (response.requestSucceeded) {
    return response.data?.votes;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestProjectVotesUpdate = createAsyncThunk(
  'votes/update',
  async (request: { projectId: number; payload: UpsertProjectVotesRequestPayload }, { rejectWithValue }) => {
    const response: Response = await VotesService.setProjectVotes(request.projectId, request.payload);

    if (response.requestSucceeded) {
      return response?.data?.status === 'ok' ? true : false;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
