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
const initialStateParticipantCreate: { [key: string]: StatusT<number> } = {};

export const participantCreateSlice = createSlice({
  name: 'participantCreateSlice',
  initialState: initialStateParticipantCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateParticipant)(builder);
  },
});

export const participantCreateReducer = participantCreateSlice.reducer;

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
const initialStateParticipant: { [key: string]: StatusT<Participant> } = {};

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
const initialStateParticipantList: { [key: string]: StatusT<Participant[]> } = {};

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
