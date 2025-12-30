/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { ObservationStratumResults } from 'src/types/Observations';

import { DetailsParams, SearchParams, selectObservationDetails } from './observationDetailsSelectors';
import { searchResultPlots } from './utils';

export type ZoneParams = DetailsParams & {
  plantingZoneName: string;
};

export type ZoneSearchParams = SearchParams & ZoneParams & { plotType?: boolean };

export const selectObservationPlantingZone = createSelector(
  [selectObservationDetails, (state, params: ZoneParams, defaultTimeZone) => params],
  (observationDetails, params) => {
    return observationDetails?.strata.find(
      (plantingZone: ObservationStratumResults) => plantingZone.name === params.plantingZoneName
    );
  }
);

export const searchObservationPlantingZone: (
  state: RootState,
  params: ZoneSearchParams,
  defaultTimeZone: string
) => ObservationStratumResults | undefined = createCachedSelector(
  selectObservationPlantingZone,
  (state: RootState, params: ZoneSearchParams, defaultTimeZone: string) => params,
  (plantingZone, params) => searchResultPlots(params.search, params.plotType, plantingZone)
)(
  (state: RootState, params: ZoneSearchParams, defaultTimeZone: string) =>
    `${params.plantingSiteId}_${params.observationId}_${params.plantingZoneName}_${defaultTimeZone}_${params.search}_${params.plotType}`
);
