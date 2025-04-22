/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { ObservationsService } from 'src/services';
import strings from 'src/strings';

import {
  setAdHocObservationsAction,
  setAdHocObservationsResultsAction,
  setObservationsAction,
  setObservationsResultsAction,
  setPlantingSiteObservationsResultsAction,
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

      const response = await ObservationsService.listObservationsResults(organizationId);
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
      // tslint:disable-next-line: no-console
      console.error('Error dispatching observations results', e);
    }
  }
);

/**
 * Fetch planting site observation results
 */
export const requestPlantingSiteObservationsResults = (
  organizationId: number,
  plantingSiteId: number,
  adHoc?: boolean
) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = adHoc
        ? await ObservationsService.listAdHocObservationsResults(organizationId, plantingSiteId)
        : await ObservationsService.listObservationsResults(organizationId, plantingSiteId);
      const { error, observations } = response;
      dispatch(
        setPlantingSiteObservationsResultsAction({
          plantingSiteId,
          data: { error, observations },
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching planting site observations results', e);
    }
  };
};

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
      // tslint:disable-next-line: no-console
      console.error('Error dispatching observations', e);
    }
  };
};

export const requestGetPlantingSiteObservationsSummaries = createAsyncThunk(
  'observations/summaries',
  async (plantingSiteId: number, { rejectWithValue }) => {
    const response = await ObservationsService.getPlantingSiteObservationsSummaries(plantingSiteId);

    if (response !== null && response.requestSucceeded && response?.data?.summaries !== undefined) {
      return response.data.summaries;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

/**
 * Fetch observation results
 */
export const requestAdHocObservationsResults = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ObservationsService.listAdHocObservationsResults(organizationId);
      const { error, observations } = response;
      dispatch(
        setAdHocObservationsResultsAction({
          error,
          observations,
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching observations results', e);
    }
  };
};
