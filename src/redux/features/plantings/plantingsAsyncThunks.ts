import { createAsyncThunk } from '@reduxjs/toolkit';
import { PlantingsService, Response } from 'src/services';
import { UpdatePlantingSubzonePayload } from 'src/types/PlantingSite';
import strings from 'src/strings';

export type UpdateRequest = {
  subzoneId: number;
  planting: UpdatePlantingSubzonePayload;
};

export const requestUpdatePlantingCompleted = createAsyncThunk(
  'updatePlantingCompleted',
  async ({ subzoneId, planting }: UpdateRequest, { rejectWithValue }) => {
    const response: Response = await PlantingsService.updatePlantingCompleted(subzoneId, planting);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
