import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response } from 'src/services/HttpService';
import ScoreService from 'src/services/ScoreService';
import strings from 'src/strings';
import { Score } from 'src/types/Score';

export const requestListScores = createAsyncThunk('scores/list', async (projectId: number, { rejectWithValue }) => {
  const response = await ScoreService.list(projectId);
  if (response) {
    return response;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestUpdateScores = createAsyncThunk(
  'scores/update',
  async (request: { projectId: number; scores: Score[] }, { rejectWithValue }) => {
    const { projectId, scores } = request;

    const response: Response = await ScoreService.update(projectId, scores);
    if (response && response.requestSucceeded) {
      return projectId;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
