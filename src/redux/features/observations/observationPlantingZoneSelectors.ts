import { createCachedSelector } from 're-reselect';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import { ObservationPlantingZoneResults } from 'src/types/Observations';
import { SearchParams, DetailsParams, selectObservationDetails } from './observationDetailsSelectors';
import { searchResultPlots } from './utils';

export type ZoneParams = DetailsParams & {
  plantingZoneId: number;
};

export type ZoneSearchParams = SearchParams & ZoneParams & { plotType?: boolean };

export const selectObservationPlantingZone = createSelector(
  [selectObservationDetails, (state, params, defaultTimeZone) => params],
  (observationDetails, params) =>
    observationDetails?.plantingZones.find(
      (plantingZone: ObservationPlantingZoneResults) => plantingZone.plantingZoneId === params.plantingZoneId
    )
);

export const searchObservationPlantingZone = createCachedSelector(
  selectObservationPlantingZone,
  (state: RootState, params: ZoneSearchParams, defaultTimeZone: string) => params,
  (plantingZone, params) => searchResultPlots(params.search, params.plotType, plantingZone)
)(
  (state: RootState, params: ZoneSearchParams, defaultTimeZone: string) =>
    `${params.plantingSiteId}_${params.observationId}_${params.plantingZoneId}_${defaultTimeZone}_${params.search}_${params.plotType}`
);
