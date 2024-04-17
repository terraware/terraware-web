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

const participantProjectsReducers = {
  participantProject: participantProjectSlice.reducer,
  participantProjectUpdate: participantProjectUpdateSlice.reducer,
  participantProjectsList: participantProjectsListSlice.reducer,
};

export default participantProjectsReducers;
