import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response } from 'src/services/HttpService';
import ScoreService from 'src/services/ScoreService';
import strings from 'src/strings';
import { Phase, Score } from 'src/types/Score';

export const requestListScores = createAsyncThunk('scores/list', async (projectId: number, { rejectWithValue }) => {
  const response = await ScoreService.get(projectId);
  if (response) {
    return response;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestUpdateScores = createAsyncThunk(
  'scores/update',
  async (request: { phase: Phase; projectId: number; scores: Score[] }, { rejectWithValue }) => {
    const { phase, projectId, scores } = request;

    const response: Response = await ScoreService.update(projectId, phase, scores);
    if (response && response.requestSucceeded) {
      return projectId;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
