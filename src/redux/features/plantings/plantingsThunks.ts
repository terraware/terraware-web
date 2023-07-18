import { Dispatch } from 'redux';
import { PlantingsService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Response } from 'src/services';
import { setPlantingsAction } from './plantingsSlice';
import { UpdatePlantingSubzonePayload } from 'src/types/PlantingSite';
import strings from 'src/strings';

export const requestPlantings = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await PlantingsService.listPlantings(organizationId, []);
      const plantings = response?.flatMap((r) => (r as any).delivery.plantings);
      dispatch(setPlantingsAction({ plantings }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching species', e);
    }
  };
};

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
