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
  setSitePopulationAction,
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
      // tslint:disable-next-line: no-console
      console.error('Error dispatching planting site', e);
    }
  };
};

export const requestPlantingSites = (organizationId: number, locale?: string | null) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.listPlantingSites(organizationId, true, locale);
      const { error, sites } = response;
      dispatch(setPlantingSitesAction({ error, plantingSites: sites }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching planting sites', e);
    }
  };
};

export const requestSitePopulation = (organizationId: number, siteId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.getTotalPlantsInZones(organizationId, siteId);
      if (response) {
        dispatch(setSitePopulationAction({ error: undefined, zones: response }));
      } else {
        dispatch(setSitePopulationAction({ error: 'Error getting site population', zones: undefined }));
      }
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching site population', e);
    }
  };
};

export const requestPlantingSitesSearchResults = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response: PlantingSiteSearchResult[] | null = await TrackingService.searchPlantingSites(organizationId);
      if (response) {
        dispatch(setPlantingSitesSearchResultsAction({ sites: response }));
      }
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching planting sites', e);
    }
  };
};

export const requestSiteReportedPlants = (plantingSiteId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.getReportedPlants(plantingSiteId);
      const { error, site } = response;
      dispatch(setSiteReportedPlantsAction({ plantingSiteId, data: { error, site } }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching site reported plants request', e);
    }
  };
};

export const requestGetPlantingSiteHistory = createAsyncThunk(
  'observations/summaries',
  async (request: { plantingSiteId: number; historyId: number }, { rejectWithValue }) => {
    const response = await TrackingService.getPlantingSiteHistory(request.plantingSiteId, request.historyId);

    if (response !== null && response.requestSucceeded && response?.data?.site !== undefined) {
      return response.data.site;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
