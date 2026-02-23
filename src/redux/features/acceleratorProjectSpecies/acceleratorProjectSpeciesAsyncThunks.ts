import { createAsyncThunk } from '@reduxjs/toolkit';

import AcceleratorProjectSpeciesService, {
  CreateAcceleratorProjectSpeciesRequestPayload,
} from 'src/services/AcceleratorProjectSpeciesService';
import strings from 'src/strings';
import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';

export const requestCreateAcceleratorProjectSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/create',
  async (request: CreateAcceleratorProjectSpeciesRequestPayload, { rejectWithValue }) => {
    const response = await AcceleratorProjectSpeciesService.create(request);

    if (response && response.requestSucceeded && response.data) {
      return response.data.participantProjectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteManyAcceleratorProjectSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/delete-many',
  async (acceleratorProjectSpeciesIds: number[], { rejectWithValue }) => {
    const response = await AcceleratorProjectSpeciesService.deleteMany(acceleratorProjectSpeciesIds);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAddManyAcceleratorProjectSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/add-many',
  async (acceleratorProjectSpecies: CreateAcceleratorProjectSpeciesRequestPayload[], { rejectWithValue }) => {
    let allSucceded = true;

    const promises = acceleratorProjectSpecies.map((ppS) => AcceleratorProjectSpeciesService.create(ppS));

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

export const requestGetAcceleratorProjectSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/get-one',
  async (acceleratorProjectSpeciesId: number, { rejectWithValue }) => {
    const response = await AcceleratorProjectSpeciesService.get(acceleratorProjectSpeciesId);

    if (response && response.requestSucceeded && response.data) {
      return response.data.participantProjectSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetProjectsForSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/get-projects-for-species',
  async (request: { speciesId: number }, { rejectWithValue }) => {
    const { speciesId } = request;

    const response = await AcceleratorProjectSpeciesService.getProjectsForSpecies(speciesId);

    if (response && response.requestSucceeded && response.data?.participantProjectsForSpecies) {
      return response.data.participantProjectsForSpecies;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListAcceleratorProjectSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/list',
  async (projectId: number, { rejectWithValue }) => {
    const response = await AcceleratorProjectSpeciesService.list(projectId);

    if (response && response.requestSucceeded && response.data?.speciesForParticipantProjects) {
      return response.data.speciesForParticipantProjects;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateAcceleratorProjectSpecies = createAsyncThunk(
  'acceleratorProjectSpecies/update',
  async (
    { acceleratorProjectSpecies }: { acceleratorProjectSpecies: AcceleratorProjectSpecies },
    { dispatch, rejectWithValue }
  ) => {
    const response = await AcceleratorProjectSpeciesService.update(acceleratorProjectSpecies);

    if (response && response.requestSucceeded && response.data) {
      void dispatch(requestGetAcceleratorProjectSpecies(acceleratorProjectSpecies.id));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
