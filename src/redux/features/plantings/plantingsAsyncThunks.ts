import { createAsyncThunk } from '@reduxjs/toolkit';

import { PlantingsService, Response } from 'src/services';
import strings from 'src/strings';
import { UpdateSubstratumPayload } from 'src/types/PlantingSite';

export type UpdateRequest = {
  substratumId: number;
  planting: UpdateSubstratumPayload;
};

export const requestUpdatePlantingCompleted = createAsyncThunk(
  'updatePlantingCompleted',
  async ({ substratumId, planting }: UpdateRequest, { rejectWithValue }) => {
    const response: Response = await PlantingsService.updatePlantingCompleted(substratumId, planting);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export type BulkUpdateRequest = {
  substratumIds: number[];
  planting: UpdateSubstratumPayload;
};

export const requestUpdatePlantingsCompleted = createAsyncThunk(
  'updatePlantingsCompleted',
  async ({ substratumIds, planting }: BulkUpdateRequest, { rejectWithValue }) => {
    const promises = substratumIds.map((substratumId) =>
      PlantingsService.updatePlantingCompleted(substratumId, planting)
    );
    const results = (await Promise.allSettled(promises)).map((result, index) => ({
      ...result,
      data: substratumIds[index],
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
