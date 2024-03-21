import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantProject } from 'src/types/ParticipantProject';

import { requestGetParticipantProject } from './participantProjectsAsyncThunks';

/**
 * Get Participant Project
 */
const initialStateParticipantProject: { [key: string]: StatusT<ParticipantProject> } = {};

export const participantProjectSlice = createSlice({
  name: 'participantProjectSlice',
  initialState: initialStateParticipantProject,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipantProject, true)(builder);
  },
});

export const participantProjectReducer = participantProjectSlice.reducer;
