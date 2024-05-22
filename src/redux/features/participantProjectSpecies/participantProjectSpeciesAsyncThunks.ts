import { Dispatch, createAsyncThunk } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/rootReducer';
import ParticipantProjectSpeciesService, {
  CreateParticipantProjectSpeciesRequestPayload,
  SpeciesProjectsResult,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { ParticipantProjectSpecies } from 'src/types/ParticipantProjectSpecies';

import { setProjectsForSpeciesAction } from './participantProjectSpeciesSlice';

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
    const response = await ParticipantProjectSpeciesService.list(projectId);

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

export const requestProjectsForSpecies = (organizationId: number, speciesId: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response: SpeciesProjectsResult[] | null = await ParticipantProjectSpeciesService.getProjectsForSpecies(
        speciesId,
        organizationId
      );

      dispatch(setProjectsForSpeciesAction({ projects: response, speciesId }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching request to get projects for a species', e);
    }
  };
};
