/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { ObservationResults, ObservationStratumResults } from 'src/types/Observations';

import { ALL_STATES, selectMergedPlantingSiteObservations } from './observationsSelectors';
import { searchResultZones } from './utils';

// search observation details (search planting zone name only)

export type DetailsParams = {
  orgId: number;
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
      selectMergedPlantingSiteObservations(state, params.plantingSiteId, params.orgId, defaultTimeZone, ALL_STATES),
    (state, params, defaultTimeZone) => params,
  ],
  (observationsResults, params) =>
    observationsResults?.find((observation: ObservationResults) => observation.observationId === params.observationId)
);

export const searchObservationDetails: (
  state: RootState,
  params: DetailsSearchParams,
  defaultTimeZone: string
) => ObservationResults | undefined = createCachedSelector(
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
export const selectDetailsZoneNames: (
  state: RootState,
  plantingSiteId: number,
  observationId: number,
  organizationId: number
) => string[] = createCachedSelector(
  (state: RootState, plantingSiteId: number, observationId: number, orgId: number) =>
    selectObservationDetails(state, { plantingSiteId, observationId, orgId, search: '', zoneNames: [] }, ''),
  (details) =>
    Array.from(
      new Set(details?.strata.map((plantingZone: ObservationStratumResults) => plantingZone.stratumName) ?? [])
    )
)((state: RootState, plantingSiteId: number, observationId: number) => `${plantingSiteId}_${observationId}`);
