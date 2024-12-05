import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestProjectScore, requestUpdateProjectScore } from 'src/redux/features/scores/scoresAsyncThunks';
import { Score } from 'src/types/Score';

/**
 * Score Get
 */
const initialStateScore: { [key: string]: StatusT<Score> } = {};

export const scoreListSlice = createSlice({
  name: 'scoreSlice',
  initialState: initialStateScore,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestProjectScore, true)(builder);
  },
});

/**
 * Score Update
 */
const initialStateScoresUpdate: { [key: number | string]: StatusT<number> } = {};

export const scoreUpdateSlice = createSlice({
  name: 'scoreUpdateSlice',
  initialState: initialStateScoresUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateProjectScore)(builder);
  },
});

const scoresReducers = {
  score: scoreListSlice.reducer,
  scoreUpdate: scoreUpdateSlice.reducer,
};

export default scoresReducers;
