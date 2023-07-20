import { Dispatch } from 'redux';
import { SearchService, TrackingService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import {
  setPlantingSitesAction,
  setPlantingSitesSearchResultsAction,
  setSitePopulationAction,
  setSiteReportedPlantsAction,
} from './trackingSlice';
import { PlantingSiteSearchResult } from 'src/types/Tracking';

export const requestPlantingSites = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.listPlantingSites(organizationId, true);
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
      const response: PlantingSiteSearchResult[] | null = await SearchService.searchPlantingSites(organizationId);
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
