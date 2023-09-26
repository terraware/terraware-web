import { createAsyncThunk } from '@reduxjs/toolkit';
import { ObservationsService, Response } from 'src/services';
import { ScheduleObservationRequestPayload, RescheduleObservationRequestPayload } from 'src/types/Observations';
import strings from 'src/strings';

export const requestScheduleObservation = createAsyncThunk(
  'scheduleObservation',
  async (request: ScheduleObservationRequestPayload, { rejectWithValue }) => {
    const response: Response = await ObservationsService.scheduleObservation(request);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export type RescheduleRequest = {
  observationId: number;
  request: RescheduleObservationRequestPayload;
};

export const requestRescheduleObservation = createAsyncThunk(
  'rescheduleObservation',
  async ({ observationId, request }: RescheduleRequest, { rejectWithValue }) => {
    const response: Response = await ObservationsService.rescheduleObservation(observationId, request);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
