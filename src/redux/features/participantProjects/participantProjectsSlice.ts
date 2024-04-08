import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantProject, ParticipantProjectSearchResult } from 'src/types/ParticipantProject';

import {
  requestGetParticipantProject,
  requestListParticipantProjects,
  requestUpdateParticipantProject,
} from './participantProjectsAsyncThunks';

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

/**
 * Get Participant Project
 */
const initialStateParticipantProjectUpdate: { [key: string]: StatusT<number> } = {};

export const participantProjectUpdateSlice = createSlice({
  name: 'participantProjectUpdateSlice',
  initialState: initialStateParticipantProjectUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateParticipantProject, true)(builder);
  },
});

export const participantProjectUpdateReducer = participantProjectUpdateSlice.reducer;

/**
 * List Participant Projects
 */
const initialStateParticipantProjectsList: { [key: string]: StatusT<ParticipantProjectSearchResult[]> } = {};

export const participantProjectsListSlice = createSlice({
  name: 'participantProjectsListSlice',
  initialState: initialStateParticipantProjectsList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListParticipantProjects)(builder);
  },
});

export const participantProjectsListReducer = participantProjectsListSlice.reducer;
