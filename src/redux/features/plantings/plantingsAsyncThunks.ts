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

export type BulkUpdateRequest = {
  subzoneIds: number[];
  planting: UpdatePlantingSubzonePayload;
};

export const requestUpdatePlantingsCompleted = createAsyncThunk(
  'updatePlantingsCompleted',
  async ({ subzoneIds, planting }: BulkUpdateRequest, { rejectWithValue }) => {
    const promises = subzoneIds.map((subzoneId) => PlantingsService.updatePlantingCompleted(subzoneId, planting));
    const results = (await Promise.allSettled(promises)).map((result, index) => ({
      ...result,
      data: subzoneIds[index],
    }));

    const succeeded = results
      .filter((result) => (result as any).value?.requestSucceeded)
      .map((result) => ({ data: result.data, value: (result as any).value?.data }));

    const failed = results
      .filter((result) => !(result as any).value?.requestSucceeded)
      .map((result) => ({ data: result.data, error: (result as any).value?.error ?? strings.GENERIC_ERROR }));

    if (failed.length && !succeeded.length) {
      return rejectWithValue(failed.map((f) => f.error).join(', '));
    }

    return true;
  }
);
