import { createAsyncThunk } from '@reduxjs/toolkit';

import ParticipantProjectSpeciesService, {
  CreateParticipantProjectSpeciesRequestPayload,
  ParticipantProjectSpecies,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';

export const requestAssignParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/assign',
  async (request: { projectIds: number[]; speciesIds: number[] }, { rejectWithValue }) => {
    const { projectIds, speciesIds } = request;
    const response = await ParticipantProjectSpeciesService.assign(projectIds, speciesIds);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/create',
  async (request: CreateParticipantProjectSpeciesRequestPayload, { rejectWithValue }) => {
    const response = await ParticipantProjectSpeciesService.create(request);

    if (response && response.requestSucceeded && response.data) {
      return response.data.participantProjectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteManyParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/delete-many',
  async (participantProjectSpeciesIds: number[], { rejectWithValue }) => {
    const response = await ParticipantProjectSpeciesService.deleteMany(participantProjectSpeciesIds);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/get-one',
  async (participantProjectSpeciesId: number, { rejectWithValue }) => {
    const response = await ParticipantProjectSpeciesService.get(participantProjectSpeciesId);

    if (response && response.requestSucceeded && response.data) {
      return response.data.participantProjectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/list',
  async (projectId: number, { rejectWithValue }) => {
    const organizationId = 1;
    const response = await ParticipantProjectSpeciesService.list(organizationId, projectId);

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/update',
  async (
    { participantProjectSpecies }: { participantProjectSpecies: ParticipantProjectSpecies },
    { dispatch, rejectWithValue }
  ) => {
    const response = await ParticipantProjectSpeciesService.update(participantProjectSpecies);

    if (response && response.requestSucceeded && response.data) {
      dispatch(requestGetParticipantProjectSpecies(participantProjectSpecies.id));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
