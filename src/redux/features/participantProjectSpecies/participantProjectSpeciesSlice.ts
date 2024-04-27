import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';

import {
  requestGetParticipantProjectSpecies,
  requestListParticipantProjectSpecies,
  requestRemoveParticipantProjectSpecies,
  requestUpdateParticipantProjectSpecies,
} from './participantProjectSpeciesAsyncThunks';

type ParticipantProjectSpeciesIdArg = { projectId: number; participantProjectSpeciesId: number };
export const participantProjectSpeciesCompositeKeyFn = (arg: unknown): string => {
  const castArg = arg as ParticipantProjectSpeciesIdArg;
  if (!(castArg.projectId && castArg.participantProjectSpeciesId)) {
    return '';
  }

  return `p${castArg.projectId}-ps${castArg.participantProjectSpeciesId}`;
};

/**
 * Get Participant Project Species
 */
const initialStateParticipantProject: { [key: string]: StatusT<ParticipantProjectSpecies> } = {};

export const participantProjectSpeciesSlice = createSlice({
  name: 'participantProjectSpeciesSlice',
  initialState: initialStateParticipantProject,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipantProjectSpecies, true, participantProjectSpeciesCompositeKeyFn)(builder);
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
    buildReducers(requestListParticipantProjectSpecies)(builder);
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

const participantProjectSpeciesReducers = {
  participantProjectSpecies: participantProjectSpeciesSlice.reducer,
  participantProjectSpeciesList: participantProjectSpeciesListSlice.reducer,
  participantProjectSpeciesUpdate: participantProjectSpeciesListSlice.reducer,
  participantProjectSpeciesRemove: participantProjectSpeciesRemoveSlice.reducer,
};

export default participantProjectSpeciesReducers;
