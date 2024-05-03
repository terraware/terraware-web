import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';

import {
  requestCreateParticipantProjectSpecies,
  requestGetParticipantProjectSpecies,
  requestListParticipantProjectSpecies,
  requestRemoveParticipantProjectSpecies,
  requestUpdateParticipantProjectSpecies,
} from './participantProjectSpeciesAsyncThunks';

/**
 * Get Participant Project Species
 */
const initialStateParticipantProject: { [key: string]: StatusT<ParticipantProjectSpecies> } = {};

export const participantProjectSpeciesSlice = createSlice({
  name: 'participantProjectSpeciesSlice',
  initialState: initialStateParticipantProject,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipantProjectSpecies, true)(builder);
  },
});

/**
 * List Participant Project Species
 */
const initialStateParticipantProjectsList: { [key: string]: StatusT<ParticipantProjectSpecies[]> } = {};

export const participantProjectSpeciesListSlice = createSlice({
  name: 'participantProjectSpeciesListSlice',
  initialState: initialStateParticipantProjectsList,
  reducers: {},
  extraReducers: (builder) => {
    // Project ID used as arg
    buildReducers(requestListParticipantProjectSpecies, true)(builder);
  },
});

/**
 * Update Participant Project Species
 */
const initialStateParticipantProjectUpdate: { [key: string]: StatusT<boolean> } = {};

export const participantProjectSpeciesUpdateSlice = createSlice({
  name: 'participantProjectSpeciesUpdateSlice',
  initialState: initialStateParticipantProjectUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateParticipantProjectSpecies, true)(builder);
  },
});

/**
 * Remove Participant Project Species
 */
const initialStateParticipantProjectRemove: { [key: string]: StatusT<boolean> } = {};

export const participantProjectSpeciesRemoveSlice = createSlice({
  name: 'participantProjectSpeciesRemoveSlice',
  initialState: initialStateParticipantProjectRemove,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestRemoveParticipantProjectSpecies)(builder);
  },
});

/**
 * Create Participant Projects Species
 */
const initialStateParticipantProjectSpeciesCreate: { [key: string]: StatusT<ParticipantProjectSpecies> } = {};

export const participantProjectSpeciesCreateSlice = createSlice({
  name: 'participantProjectSpeciesCreateSlice',
  initialState: initialStateParticipantProjectSpeciesCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateParticipantProjectSpecies)(builder);
  },
});

const participantProjectSpeciesReducers = {
  participantProjectSpecies: participantProjectSpeciesSlice.reducer,
  participantProjectSpeciesList: participantProjectSpeciesListSlice.reducer,
  participantProjectSpeciesUpdate: participantProjectSpeciesListSlice.reducer,
  participantProjectSpeciesRemove: participantProjectSpeciesRemoveSlice.reducer,
  participantProjectSpeciesCreate: participantProjectSpeciesCreateSlice.reducer,
};

export default participantProjectSpeciesReducers;
