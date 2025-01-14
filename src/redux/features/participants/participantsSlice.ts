import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Participant } from 'src/types/Participant';

import {
  requestCreateParticipant,
  requestDeleteParticipant,
  requestGetParticipant,
  requestListParticipants,
  requestUpdateParticipant,
} from './participantsAsyncThunks';

/**
 * Create Participant
 */
const initialStateParticipantCreate: { [key: string]: StatusT<Participant> } = {};

export const participantCreateSlice = createSlice({
  name: 'participantCreateSlice',
  initialState: initialStateParticipantCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateParticipant)(builder);
  },
});

/**
 * Delete Participant
 */
const initialStateParticipantDelete: { [key: string]: StatusT<boolean> } = {};

export const participantDeleteSlice = createSlice({
  name: 'participantDeleteSlice',
  initialState: initialStateParticipantDelete,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteParticipant)(builder);
  },
});

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

/**
 * Participant update
 */
const initialStateParticipantUpdate: { [key: string]: StatusT<boolean> } = {};

export const participantUpdateSlice = createSlice({
  name: 'participantUpdateSlice',
  initialState: initialStateParticipantUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateParticipant)(builder);
  },
});

const participantsReducers = {
  participantCreate: participantCreateSlice.reducer,
  participantDelete: participantDeleteSlice.reducer,
  participant: participantSlice.reducer,
  participantList: participantListSlice.reducer,
  participantUpdate: participantUpdateSlice.reducer,
};

export default participantsReducers;
