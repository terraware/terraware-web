import { createAsyncThunk } from '@reduxjs/toolkit';

import ParticipantProjectSpeciesService, {
  CreateParticipantProjectSpeciesRequestPayload,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { ParticipantProjectSpecies } from 'src/types/ParticipantProjectSpecies';

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

export const requestAddManyParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/add-many',
  async (participantProjectSpecies: CreateParticipantProjectSpeciesRequestPayload[], { rejectWithValue }) => {
    let allSucceded = true;

    const promises = participantProjectSpecies.map((ppS) => ParticipantProjectSpeciesService.create(ppS));

    const results = await Promise.all(promises);

    results.forEach((res) => {
      if (!res.requestSucceeded) {
        allSucceded = false;
      }
    });

    if (allSucceded) {
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

export const requestGetProjectsForSpecies = createAsyncThunk(
  'participantProjectSpecies/get-projects-for-species',
  async (request: { speciesId: number }, { rejectWithValue }) => {
    const { speciesId } = request;

    const response = await ParticipantProjectSpeciesService.getProjectsForSpecies(speciesId);

    if (response && response.requestSucceeded && response.data?.participantProjectsForSpecies) {
      return response.data.participantProjectsForSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/list',
  async (projectId: number, { rejectWithValue }) => {
    const response = await ParticipantProjectSpeciesService.list(projectId);

    if (response && response.requestSucceeded && response.data?.speciesForParticipantProjects) {
      return response.data.speciesForParticipantProjects;
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
