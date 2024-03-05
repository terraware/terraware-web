import { createAsyncThunk } from '@reduxjs/toolkit';

import { TrackingService } from 'src/services';
import strings from 'src/strings';
import { MonitoringPlotSearchResult } from 'src/types/Tracking';

export type MonitoringPlotsRequest = {
  plantingSiteId: number;
  monitoringPlotIds: number[];
};

export type MonitoringPlotsResponse = Record<number, MonitoringPlotSearchResult>;

export const requestMonitoringPlots = createAsyncThunk(
  'requestMonitoringPlots',
  async ({ plantingSiteId, monitoringPlotIds }: MonitoringPlotsRequest, { rejectWithValue }) => {
    const response: MonitoringPlotSearchResult[] | null = await TrackingService.searchMonitoringPlots(
      plantingSiteId,
      monitoringPlotIds
    );
    if (response !== null) {
      return response.reduce((acc: MonitoringPlotsResponse, plotResult: MonitoringPlotSearchResult) => {
        acc[Number(plotResult.id)] = plotResult;
        return acc;
      }, {} as MonitoringPlotsResponse);
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
