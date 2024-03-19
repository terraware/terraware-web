import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantData, ParticipantsData } from 'src/services/ParticipantsService';

import {
  requestDeleteParticipant,
  requestGetParticipant,
  requestListParticipants,
  requestUpdateParticipant,
} from './participantsAsyncThunks';

/**
 * Delete Participant
 */
const initialStateParticipantDelete: { [key: string]: StatusT<number> } = {};

export const participantDeleteSlice = createSlice({
  name: 'participantDeleteSlice',
  initialState: initialStateParticipantDelete,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteParticipant)(builder);
  },
});

export const participantDeleteReducer = participantDeleteSlice.reducer;

/**
 * Get Participant
 */
const initialStateParticipant: { [key: string]: StatusT<ParticipantData> } = {};

export const participantSlice = createSlice({
  name: 'participantSlice',
  initialState: initialStateParticipant,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipant, true)(builder);
  },
});

export const participantReducer = participantSlice.reducer;

/**
 * Participant list
 */
const initialStateParticipantList: { [key: string]: StatusT<ParticipantsData> } = {};

export const participantListSlice = createSlice({
  name: 'participantListSlice',
  initialState: initialStateParticipantList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListParticipants)(builder);
  },
});

export const participantListReducer = participantListSlice.reducer;

/**
 * Participant update
 */
const initialStateParticipantUpdate: { [key: string]: StatusT<number> } = {};

export const participantUpdateSlice = createSlice({
  name: 'participantUpdateSlice',
  initialState: initialStateParticipantUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateParticipant)(builder);
  },
});

export const participantUpdateReducer = participantUpdateSlice.reducer;
