import { createAsyncThunk } from '@reduxjs/toolkit';

import ParticipantProjectSpeciesService, {
  AllSpeciesResponse,
  DeleteParticipantProjectSpeciesResponse,
  ParticipantProjectSpecies,
  ParticipantProjectSpeciesResponse,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';

export const requestGetParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/get-one',
  async (
    { participantProjectSpeciesId }: { projectId: number; participantProjectSpeciesId: number },
    { rejectWithValue }
  ) => {
    const response: ParticipantProjectSpeciesResponse =
      await ParticipantProjectSpeciesService.get(participantProjectSpeciesId);

    if (response && response.requestSucceeded) {
      return response.data.participantProjectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/list',
  async (projectId: number, { rejectWithValue }) => {
    const response: AllSpeciesResponse = await ParticipantProjectSpeciesService.list(projectId);

    if (response && response.requestSucceeded) {
      return response.data.participantProjectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/update',
  async (
    {
      projectId,
      participantProjectSpeciesId,
      participantProjectSpecies,
    }: { projectId: number; participantProjectSpeciesId: number; participantProjectSpecies: ParticipantProjectSpecies },
    { dispatch, rejectWithValue }
  ) => {
    const response: ParticipantProjectSpeciesResponse = await ParticipantProjectSpeciesService.update(
      projectId,
      participantProjectSpeciesId,
      participantProjectSpecies
    );

    if (response && response.requestSucceeded) {
      dispatch(requestGetParticipantProjectSpecies({ projectId, participantProjectSpeciesId }));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestRemoveParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/remove',
  async (
    { projectId, participantProjectSpeciesId }: { projectId: number; participantProjectSpeciesId: number },
    { rejectWithValue }
  ) => {
    const response: DeleteParticipantProjectSpeciesResponse = await ParticipantProjectSpeciesService.remove(
      projectId,
      participantProjectSpeciesId
    );

    if (response?.status === 'ok') {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
