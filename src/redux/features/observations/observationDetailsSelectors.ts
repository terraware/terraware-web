import { createCachedSelector } from 're-reselect';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import { ObservationResults } from 'src/types/Observations';
import { selectMergedPlantingSiteObservations } from './observationsSelectors';
import { searchResultZones } from './utils';

// search observation details (search planting zone name only)

export type DetailsParams = {
  plantingSiteId: number;
  observationId: number;
};

export type SearchParams = {
  search: string;
};

export type DetailsSearchParams = SearchParams & DetailsParams;

export const selectObservationDetails = createSelector(
  [
    (state, params, defaultTimeZone) =>
      selectMergedPlantingSiteObservations(state, params.plantingSiteId, defaultTimeZone),
    (state, params, defaultTimeZone) => params,
  ],
  (observationsResults, params) =>
    observationsResults?.find((observation: ObservationResults) => observation.observationId === params.observationId)
);

export const searchObservationDetails = createCachedSelector(
  selectObservationDetails,
  (state: RootState, params: DetailsSearchParams, defaultTimeZone: string) => params,
  (observation, params) => searchResultZones(params.search, observation)
)(
  (state: RootState, params: DetailsSearchParams, defaultTimeZone: string) =>
    `${params.plantingSiteId}_${params.observationId}_${defaultTimeZone}_${params.search}`
);
