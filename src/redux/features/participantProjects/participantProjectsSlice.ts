import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantProject } from 'src/types/ParticipantProject';

import { requestListParticipantProjects } from './participantProjectsAsyncThunks';

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
  participantProjectsList: participantProjectsListSlice.reducer,
};

export default participantProjectsReducers;
