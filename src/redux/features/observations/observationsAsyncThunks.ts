import { createAsyncThunk } from '@reduxjs/toolkit';
import { ObservationsService, Response } from 'src/services';
import {
  ScheduleObservationRequestPayload,
  ReplaceObservationPlotRequestPayload,
  ReplaceObservationPlotResponsePayload,
  RescheduleObservationRequestPayload,
} from 'src/types/Observations';
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

export type ReplaceObservationPlotRequest = {
  observationId: number;
  plotId: number;
  request: ReplaceObservationPlotRequestPayload;
};

export const requestReplaceObservationPlot = createAsyncThunk(
  'replaceObservationPlot',
  async ({ observationId, plotId, request }: ReplaceObservationPlotRequest, { rejectWithValue }) => {
    const response: Response & ReplaceObservationPlotResponsePayload = await ObservationsService.replaceObservationPlot(
      observationId,
      plotId,
      request
    );
    if (response.requestSucceeded) {
      const { addedMonitoringPlotIds, removedMonitoringPlotIds } = response;
      return { addedMonitoringPlotIds, removedMonitoringPlotIds };
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
