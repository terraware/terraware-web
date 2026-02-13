import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantProject } from 'src/types/ParticipantProject';

import { requestListParticipantProjects, requestUpdateParticipantProject } from './participantProjectsAsyncThunks';

/**
 * Update Participant Project
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
const initialStateParticipantProjectsList: { [key: string]: StatusT<ParticipantProject[]> } = {};

export const participantProjectsListSlice = createSlice({
  name: 'participantProjectsListSlice',
  initialState: initialStateParticipantProjectsList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListParticipantProjects)(builder);
  },
});

const participantProjectsReducers = {
  participantProjectUpdate: participantProjectUpdateSlice.reducer,
  participantProjectsList: participantProjectsListSlice.reducer,
};

export default participantProjectsReducers;
