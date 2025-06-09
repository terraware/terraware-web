/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { TrackingService } from 'src/services';
import strings from 'src/strings';
import { PlantingSiteSearchResult } from 'src/types/Tracking';

import {
  setPlantingSiteAction,
  setPlantingSitesAction,
  setPlantingSitesSearchResultsAction,
  setSiteReportedPlantsAction,
} from './trackingSlice';

export const requestPlantingSite = (plantingSiteId: number, locale?: string | null) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.getPlantingSite(plantingSiteId);
      const { error, site } = response;
      dispatch(setPlantingSiteAction({ error, locale, plantingSite: site }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching planting site', e);
    }
  };
};

export const requestPlantingSites = createAsyncThunk(
  'requestPlantingSites',
  async (organizationId: number, { dispatch, getState, rejectWithValue, fulfillWithValue }) => {
    try {
      const existingRequest = (getState() as RootState).tracking;

      if (['success'].includes(existingRequest?.data?.status)) {
        return fulfillWithValue(existingRequest?.data?.data?.plantingSites);
      }

      if (['pending'].includes(existingRequest?.data?.status)) {
        return;
      }

      const response = await TrackingService.fetchPlantingSiteList(organizationId, true);
      if (response && response.requestSucceeded) {
        const { error, sites } = response;
        dispatch(setPlantingSitesAction({ error, plantingSites: sites, organizationId }));
        return fulfillWithValue(sites);
      }

      return rejectWithValue(strings.GENERIC_ERROR);
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching planting sites', e);
    }
  }
);

export const requestPlantingSitesSearchResults = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response: PlantingSiteSearchResult[] | null = await TrackingService.searchPlantingSites(organizationId);
      if (response) {
        dispatch(setPlantingSitesSearchResultsAction({ sites: response }));
      }
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching planting sites', e);
    }
  };
};

export const requestSiteReportedPlants = (plantingSiteId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.getReportedPlants(plantingSiteId);
      dispatch(setSiteReportedPlantsAction({ plantingSiteId, data: { site: response.data?.site } }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching site reported plants request', e);
    }
  };
};

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
