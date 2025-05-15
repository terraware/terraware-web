import { createAsyncThunk } from '@reduxjs/toolkit';

import { ObservationsService } from 'src/services';
import strings from 'src/strings';

export const requestPlantingSiteObservationSummaries = createAsyncThunk(
  'observations/siteSummaries',
  async (plantingSiteId: number, { rejectWithValue }) => {
    const response = await ObservationsService.getPlantingSiteObservationsSummaries(plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.summaries !== undefined) {
      return response.data.summaries;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPlantingSiteObservations = createAsyncThunk(
  'observations/site',
  async (request: { plantingSiteId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listPlantingSiteObservations(request.plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPlantingSiteObservationResults = createAsyncThunk(
  'observations/siteResults',
  async (request: { plantingSiteId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listPlantingSiteObservationResults(request.plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPlantingSiteAdHocObservations = createAsyncThunk(
  'observations/siteAdHoc',
  async (request: { plantingSiteId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listPlantingSiteAdHocObservations(request.plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPlantingSiteAdHocObservationResults = createAsyncThunk(
  'observations/siteAdHocResults',
  async (request: { plantingSiteId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listPlantingSiteObservationResults(request.plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestOrganizationObservations = createAsyncThunk(
  'observations/org',
  async (request: { organizationId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listOrganizationAdHocObservations(request.organizationId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestOrganizationObservationResults = createAsyncThunk(
  'observations/orgResults',
  async (request: { organizationId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listOrganizationObservationResults(request.organizationId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestOrganizationAdHocObservations = createAsyncThunk(
  'observations/orgAdHoc',
  async (request: { organizationId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listOrganizationAdHocObservationResults(request.organizationId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestOrganizationAdHocObservationResults = createAsyncThunk(
  'observations/orgAdHocResults',
  async (request: { organizationId: number }, { rejectWithValue }) => {
    const response = await ObservationsService.listOrganizationObservationResults(request.organizationId);

    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
