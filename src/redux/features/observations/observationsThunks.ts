/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { ObservationsService } from 'src/services';
import strings from 'src/strings';

import {
  setAdHocObservationResultsAction,
  setAdHocObservationsAction,
  setObservationsAction,
  setObservationsResultsAction,
} from './observationsSlice';

/**
 * Fetch observation results
 */
export const requestObservationsResults = createAsyncThunk(
  'requestPlantingSites',
  async (organizationId: number, { dispatch, getState, rejectWithValue, fulfillWithValue }) => {
    try {
      const existingRequest = (getState() as RootState).observationsResults;

      if (['success'].includes(existingRequest?.data?.status)) {
        return fulfillWithValue(existingRequest?.data?.data?.observations);
      }

      if (['pending'].includes(existingRequest?.data?.status)) {
        return;
      }

      const response = await ObservationsService.listObservationResults(organizationId);
      if (response && response.requestSucceeded) {
        const { error, observations } = response;
        dispatch(
          setObservationsResultsAction({
            error,
            observations,
            organizationId,
          })
        );
        return fulfillWithValue(observations);
      }
      return rejectWithValue(strings.GENERIC_ERROR);
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching observations results', e);
    }
  }
);

/**
 * Fetch observations
 */
export const requestObservations = (organizationId: number, adHoc?: boolean) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = adHoc
        ? await ObservationsService.listAdHocObservations(organizationId)
        : await ObservationsService.listObservations(organizationId);
      const { error, observations } = response;
      dispatch(
        adHoc
          ? setAdHocObservationsAction({
              error,
              observations,
            })
          : setObservationsAction({
              error,
              observations,
            })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching observations', e);
    }
  };
};

export const requestPlantingSiteObservationSummaries = createAsyncThunk(
  'observations/summaries',
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
    const response = await ObservationsService.listOrganizationObservations(request.organizationId);
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
    const response = await ObservationsService.listOrganizationAdHocObservationResults(request.organizationId);
    if (response !== null && response.requestSucceeded && response?.data?.observations !== undefined) {
      return response.data.observations;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

/**
 * Fetch observation results
 */
export const requestAdHocObservationResults = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ObservationsService.listAdHocObservationResults(organizationId);
      const { error, observations } = response;
      dispatch(
        setAdHocObservationResultsAction({
          error,
          observations,
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching observations results', e);
    }
  };
};
