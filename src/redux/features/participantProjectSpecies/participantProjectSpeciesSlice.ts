import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  ParticipantProjectSpecies,
  SpeciesWithParticipantProjectsSearchResponse,
} from 'src/services/ParticipantProjectSpeciesService';

import {
  requestAssignParticipantProjectSpecies,
  requestCreateParticipantProjectSpecies,
  requestDeleteManyParticipantProjectSpecies,
  requestGetParticipantProjectSpecies,
  requestListParticipantProjectSpecies,
  requestUpdateParticipantProjectSpecies,
} from './participantProjectSpeciesAsyncThunks';

/**
 * Assign Participant Projects Species
 */
const initialStateParticipantProjectSpeciesAssign: { [key: string]: StatusT<boolean> } = {};

export const participantProjectSpeciesAssignSlice = createSlice({
  name: 'participantProjectSpeciesAssignSlice',
  initialState: initialStateParticipantProjectSpeciesAssign,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAssignParticipantProjectSpecies)(builder);
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

/**
 * Remove Participant Project Species
 */
const initialStateParticipantProjectDeleteMany: { [key: string]: StatusT<boolean> } = {};

export const participantProjectSpeciesDeleteManySlice = createSlice({
  name: 'participantProjectSpeciesDeleteManySlice',
  initialState: initialStateParticipantProjectDeleteMany,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteManyParticipantProjectSpecies)(builder);
  },
});

/**
 * Get Participant Project Species
 */
const initialStateParticipantProjectGet: { [key: string]: StatusT<ParticipantProjectSpecies> } = {};

export const participantProjectSpeciesGetSlice = createSlice({
  name: 'participantProjectSpeciesGetSlice',
  initialState: initialStateParticipantProjectGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipantProjectSpecies, true)(builder);
  },
});

/**
 * List Participant Project Species
 */
const initialStateParticipantProjectsList: { [key: string]: StatusT<SpeciesWithParticipantProjectsSearchResponse[]> } =
  {};

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

const participantProjectSpeciesReducers = {
  participantProjectSpeciesAssign: participantProjectSpeciesAssignSlice.reducer,
  participantProjectSpeciesCreate: participantProjectSpeciesCreateSlice.reducer,
  participantProjectSpeciesDeleteMany: participantProjectSpeciesDeleteManySlice.reducer,
  participantProjectSpeciesGet: participantProjectSpeciesGetSlice.reducer,
  participantProjectSpeciesList: participantProjectSpeciesListSlice.reducer,
  participantProjectSpeciesUpdate: participantProjectSpeciesUpdateSlice.reducer,
};

export default participantProjectSpeciesReducers;
