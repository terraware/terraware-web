import { createAsyncThunk } from '@reduxjs/toolkit';

import { TrackingService } from 'src/services';
import { PlantingSitePutRequestBody } from 'src/services/TrackingService';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { fromDraft } from 'src/utils/draftPlantingSiteUtils';

export const createPlantingSite = createAsyncThunk(
  'createPlantingSite',
  async (draft: DraftPlantingSite, { rejectWithValue }) => {
    const payload = fromDraft(draft);
    const response = await TrackingService.createPlantingSite(payload);

    if (response && response.requestSucceeded && response.data) {
      return response.data.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const validatePlantingSite = createAsyncThunk(
  'validatePlantingSite',
  async (draft: DraftPlantingSite, { rejectWithValue }) => {
    const payload = fromDraft(draft);
    const response = await TrackingService.validatePlantingSite(payload);

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
