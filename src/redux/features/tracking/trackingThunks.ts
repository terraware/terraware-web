import { createAsyncThunk } from '@reduxjs/toolkit';

import { TrackingService } from 'src/services';
import strings from 'src/strings';

export const requestListPlantingSites = createAsyncThunk(
  'tracking/plantingSites',
  async (organizationId: number, { rejectWithValue }) => {
    const response = await TrackingService.listPlantingSites(organizationId, true);

    if (response !== null && response.requestSucceeded && response?.data?.sites !== undefined) {
      return response.data.sites;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestOrganizationReportedPlants = createAsyncThunk(
  'tracking/organizationReportedPlants',
  async (organizationId: number, { rejectWithValue }) => {
    const response = await TrackingService.listOrganizationReportedPlants(organizationId);

    if (response !== null && response.requestSucceeded && response?.data?.sites !== undefined) {
      return response.data.sites;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPlantingSiteReportedPlants = createAsyncThunk(
  'tracking/siteReportedPlants',
  async (plantingSiteId: number, { rejectWithValue }) => {
    const response = await TrackingService.getReportedPlants(plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.site !== undefined) {
      return response.data.site;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetPlantingSiteHistory = createAsyncThunk(
  'tracking/siteHistory',
  async (request: { plantingSiteId: number; historyId: number }, { rejectWithValue }) => {
    const response = await TrackingService.getPlantingSiteHistory(request.plantingSiteId, request.historyId);

    if (response !== null && response.requestSucceeded && response?.data?.site !== undefined) {
      return response.data.site;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListPlantingSiteHistories = createAsyncThunk(
  'tracking/siteHistories',
  async (plantingSiteId: number, { rejectWithValue }) => {
    const response = await TrackingService.listPlantingSiteHistories(plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.histories !== undefined) {
      return response.data.histories;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);