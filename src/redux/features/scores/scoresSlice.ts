import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestListScores, requestUpdateScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { ScoresData } from 'src/types/Score';

/**
 * Score list
 */
const initialStateScoreList: { [key: string]: StatusT<ScoresData> } = {};

export const scoreListSlice = createSlice({
  name: 'scoreListSlice',
  initialState: initialStateScoreList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListScores, true)(builder);
  },
});

export const scoreListReducer = scoreListSlice.reducer;

/**
 * Simple response to know if the scores of the project were updated
 */
const initialStateScoresUpdate: { [key: number | string]: StatusT<number> } = {};

export const scoresUpdateSlice = createSlice({
  name: 'scoresUpdateSlice',
  initialState: initialStateScoresUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateScores)(builder);
  },
});

export const scoresUpdateReducer = scoresUpdateSlice.reducer;
