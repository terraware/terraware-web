import { createAsyncThunk } from '@reduxjs/toolkit';

import ParticipantProjectSpeciesService, {
  AllSpeciesResponse,
  DeleteProjectSpeciesResponse,
  ProjectSpecies,
  ProjectSpeciesResponse,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';

export const requestGetParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/get-one',
  async ({ projectId, projectSpeciesId }: { projectId: number; projectSpeciesId: number }, { rejectWithValue }) => {
    const response: ProjectSpeciesResponse = await ParticipantProjectSpeciesService.get(projectId, projectSpeciesId);

    if (response && response.requestSucceeded) {
      return response.data.projectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/list',
  async (projectId: number | undefined = undefined, { rejectWithValue }) => {
    const response: AllSpeciesResponse = await ParticipantProjectSpeciesService.list(projectId);

    if (response && response.requestSucceeded) {
      return response.data.projectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/update',
  async (
    {
      projectId,
      projectSpeciesId,
      projectSpecies,
    }: { projectId: number; projectSpeciesId: number; projectSpecies: ProjectSpecies },
    { dispatch, rejectWithValue }
  ) => {
    const response: ProjectSpeciesResponse = await ParticipantProjectSpeciesService.update(
      projectId,
      projectSpeciesId,
      projectSpecies
    );

    if (response && response.requestSucceeded) {
      dispatch(requestGetParticipantProjectSpecies({ projectId, projectSpeciesId }));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestRemoveParticipantProjectSpecies = createAsyncThunk(
  'participantProjectSpecies/remove',
  async ({ projectId, projectSpeciesId }: { projectId: number; projectSpeciesId: number }, { rejectWithValue }) => {
    const response: DeleteProjectSpeciesResponse = await ParticipantProjectSpeciesService.remove(
      projectId,
      projectSpeciesId
    );

    if (response?.status === 'ok') {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
