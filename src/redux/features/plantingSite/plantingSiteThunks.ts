import { createAsyncThunk } from '@reduxjs/toolkit';

import { TrackingService } from 'src/services';
import { PlantingSitePutRequestBody } from 'src/services/TrackingService';
import strings from 'src/strings';
import { CreatePlantingSiteRequestPayload } from 'src/types/PlantingSite';

export const createPlantingSite = createAsyncThunk(
  'createPlantingSite',
  async (site: CreatePlantingSiteRequestPayload, { rejectWithValue }) => {
    const response = await TrackingService.createPlantingSite(site);

    if (response && response.requestSucceeded && response.data) {
      return response.data.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const validatePlantingSite = createAsyncThunk(
  'validatePlantingSite',
  async (site: CreatePlantingSiteRequestPayload, { rejectWithValue }) => {
    const response = await TrackingService.validatePlantingSite(site);

    if (response && response.requestSucceeded && response.data) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const updatePlantingSite = createAsyncThunk(
  'updatePlantingSite',
  async (request: { id: number; plantingSite: PlantingSitePutRequestBody }, { rejectWithValue }) => {
    const response = await TrackingService.updatePlantingSite(request.id, request.plantingSite);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const deletePlantingSite = createAsyncThunk('deletePlantingSite', async (id: number, { rejectWithValue }) => {
  const response = await TrackingService.deletePlantingSite(id);

  if (response && response.requestSucceeded) {
    return true;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});
