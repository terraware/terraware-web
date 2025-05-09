import { createAsyncThunk } from '@reduxjs/toolkit';

import { ObservationsService, Response } from 'src/services';
import strings from 'src/strings';
import {
  ReplaceObservationPlotRequestPayload,
  RescheduleObservationRequestPayload,
  ScheduleObservationRequestPayload,
} from 'src/types/Observations';

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

export type ReplaceObservationPlotRequest = {
  observationId: number;
  plotId: number;
  request: ReplaceObservationPlotRequestPayload;
};

export const requestReplaceObservationPlot = createAsyncThunk(
  'replaceObservationPlot',
  async ({ observationId, plotId, request }: ReplaceObservationPlotRequest, { rejectWithValue }) => {
    const response = await ObservationsService.replaceObservationPlot(observationId, plotId, request);
    if (response.requestSucceeded && response.data) {
      const { addedMonitoringPlotIds, removedMonitoringPlotIds } = response.data;
      return { addedMonitoringPlotIds, removedMonitoringPlotIds };
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestAbandonObservation = createAsyncThunk(
  'abandonObservation',
  async ({ observationId }: { observationId: number }, { rejectWithValue }) => {
    const response: Response = await ObservationsService.abandonObservation(observationId);
    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
