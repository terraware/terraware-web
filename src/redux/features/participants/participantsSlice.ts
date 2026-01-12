import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Participant } from 'src/types/Participant';

import { requestGetParticipant, requestListParticipants } from './participantsAsyncThunks';

/**
 * Get Participant
 */
const initialStateParticipant: { [key: string]: StatusT<Participant> } = {};

export const participantSlice = createSlice({
  name: 'participantSlice',
  initialState: initialStateParticipant,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipant, true)(builder);
  },
});

/**
 * Participant list
 */
const initialStateParticipantList: { [key: string]: StatusT<Participant[]> } = {};

export const participantListSlice = createSlice({
  name: 'participantListSlice',
  initialState: initialStateParticipantList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListParticipants)(builder);
  },
});

const participantsReducers = {
  participant: participantSlice.reducer,
  participantList: participantListSlice.reducer,
};

export default participantsReducers;
