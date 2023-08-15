import { createCachedSelector } from 're-reselect';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import { ObservationResults, ObservationPlantingZoneResults } from 'src/types/Observations';
import { selectMergedPlantingSiteObservations, ALL_STATES } from './observationsSelectors';
import { searchResultZones } from './utils';

// search observation details (search planting zone name only)

export type DetailsParams = {
  plantingSiteId: number;
  observationId: number;
};

export type SearchParams = {
  search: string;
};

export type DetailsSearchParams = SearchParams &
  DetailsParams & {
    zoneNames: string[];
  };

export const selectObservationDetails = createSelector(
  [
    (state, params, defaultTimeZone) =>
      selectMergedPlantingSiteObservations(state, params.plantingSiteId, defaultTimeZone, ALL_STATES),
    (state, params, defaultTimeZone) => params,
  ],
  (observationsResults, params) =>
    observationsResults?.find((observation: ObservationResults) => observation.observationId === params.observationId)
);

export const searchObservationDetails = createCachedSelector(
  selectObservationDetails,
  (state: RootState, params: DetailsSearchParams, defaultTimeZone: string) => params,
  (observation, params) => searchResultZones(params.search, params.zoneNames, observation)
)(
  (state: RootState, params: DetailsSearchParams, defaultTimeZone: string) =>
    `${params.plantingSiteId}_${params.observationId}_${defaultTimeZone}_${params.search}_${Array.from(
      new Set(params.zoneNames)
    ).toString()}`
);

// get zone names in observation result
export const selectDetailsZoneNames = createCachedSelector(
  (state: RootState, plantingSiteId: number, observationId: number) =>
    selectObservationDetails(state, { plantingSiteId, observationId, search: '', zoneNames: [] }, ''),
  (details) =>
    Array.from(
      new Set(
        details?.plantingZones.map((plantingZone: ObservationPlantingZoneResults) => plantingZone.plantingZoneName) ??
          []
      )
    )
)((state: RootState, plantingSiteId: number, observationId: number) => `${plantingSiteId}_${observationId}`);
