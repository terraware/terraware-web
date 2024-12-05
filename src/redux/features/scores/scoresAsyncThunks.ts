import { createAsyncThunk } from '@reduxjs/toolkit';

import ScoreService from 'src/services/ScoreService';
import strings from 'src/strings';
import { Score } from 'src/types/Score';

export const requestProjectScore = createAsyncThunk('score/get', async (projectId: number, { rejectWithValue }) => {
  const response = await ScoreService.get(projectId);
  if (response && response.data) {
    return response.data.score;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestUpdateProjectScore = createAsyncThunk(
  'score/update',
  async (request: { projectId: number; score: Score }, { rejectWithValue }) => {
    const { projectId, score } = request;

    const response = await ScoreService.update(projectId, score);
    if (response && response.requestSucceeded) {
      return;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
