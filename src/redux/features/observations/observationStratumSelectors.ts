/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { ObservationStratumResults } from 'src/types/Observations';

import { DetailsParams, SearchParams, selectObservationDetails } from './observationDetailsSelectors';
import { searchResultPlots } from './utils';

export type StratumParams = DetailsParams & {
  stratumName: string;
};

export type StratumSearchParams = SearchParams & StratumParams & { plotType?: boolean };

export const selectObservationStratum = createSelector(
  [selectObservationDetails, (state, params: StratumParams, defaultTimeZone) => params],
  (observationDetails, params) => {
    return observationDetails?.strata.find((stratum: ObservationStratumResults) => stratum.name === params.stratumName);
  }
);

export const searchObservationStratum: (
  state: RootState,
  params: StratumSearchParams,
  defaultTimeZone: string
) => ObservationStratumResults | undefined = createCachedSelector(
  selectObservationStratum,
  (state: RootState, params: StratumSearchParams, defaultTimeZone: string) => params,
  (stratum, params) => searchResultPlots(params.search, params.plotType, stratum)
)(
  (state: RootState, params: StratumSearchParams, defaultTimeZone: string) =>
    `${params.plantingSiteId}_${params.observationId}_${params.stratumName}_${defaultTimeZone}_${params.search}_${params.plotType}`
);
