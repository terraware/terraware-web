import { createCachedSelector } from 're-reselect';

import { selectSpeciesList } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import { ObservationResults, ObservationResultsPayload, ObservationState } from 'src/types/Observations';

import { mergeObservations, searchStrataAndDates } from './utils';

export const selectObservationsResults = (state: RootState) => state.observationsResults?.observations;
export const selectOrgObservationsResults = (orgId: number) => (state: RootState) =>
  state.observationsResults?.[orgId]?.data?.observations;

/**
 * Select observations results, filtered down by planting site and/or observation state.
 * Preserves order of results.
 */
export const selectPlantingSiteObservationsResults: (
  state: RootState,
  plantingSiteId: number,
  status?: ObservationState[],
  orgId?: number
) => ObservationResultsPayload[] | undefined = createCachedSelector(
  (state: RootState, plantingSiteId: number, status?: ObservationState[], orgId?: number) =>
    orgId && orgId !== -1 ? selectOrgObservationsResults(orgId)(state) : selectObservationsResults(state),
  (state: RootState, plantingSiteId: number, status?: ObservationState[], orgId?: number) => plantingSiteId,
  (state: RootState, plantingSiteId: number, status?: ObservationState[], orgId?: number) => status,
  (observationsResults, plantingSiteId, status) => {
    if (plantingSiteId === -1 && !status?.length) {
      // default to hide Upcoming if no status is selected
      return observationsResults?.filter((result) => result.state !== 'Upcoming');
    }
    return observationsResults?.filter((observationResults) => {
      const matchesSite = plantingSiteId === -1 || observationResults.plantingSiteId === plantingSiteId;
      const matchesState =
        (!status?.length && observationResults.state !== 'Upcoming') ||
        (status && status.indexOf(observationResults.state) !== -1);
      return matchesSite && matchesState;
    });
  }
)((state, plantingSiteId: number, status?: ObservationState[]) => `${plantingSiteId}_${status?.join(',')}`);

/**
 * Merge named entity information with observation results.
 * Preserves order of results.
 */
export const selectMergedPlantingSiteObservations: (
  state: RootState,
  plantingSiteId: number,
  orgId: number,
  defaultTimeZone: string,
  status?: ObservationState[]
) => ObservationResults[] | undefined = createCachedSelector(
  (state: RootState, plantingSiteId: number, orgId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    selectPlantingSiteObservationsResults(state, plantingSiteId, status, orgId),
  (state: RootState, plantingSiteId: number, orgId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    selectPlantingSites(state),
  (state: RootState, plantingSiteId: number, orgId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    selectSpeciesList(orgId)(state),
  (state: RootState, plantingSiteId: number, orgId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    defaultTimeZone,
  (observations, plantingSites, species, defaultTimeZone) => {
    if (!observations) {
      return observations;
    }
    return mergeObservations(observations, defaultTimeZone, plantingSites, species?.data ?? []);
  }
)(
  (state: RootState, plantingSiteId: number, orgId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    `${plantingSiteId}_${orgId}_${defaultTimeZone}_${status?.join(',')}`
);

/**
 * Search observations (search stratum name and date only at this time).
 * Preserves order of results.
 */
export const searchObservations: (
  state: RootState,
  plantingSiteId: number,
  orgId: number,
  defaultTimeZone: string,
  search: string,
  stratumNames: string[],
  status?: ObservationState[],
  locale?: string
) => ObservationResults[] | undefined = createCachedSelector(
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    stratumNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => search,
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    stratumNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => stratumNames,
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    stratumNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => locale,
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    stratumNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => selectMergedPlantingSiteObservations(state, plantingSiteId, orgId, defaultTimeZone, status),
  searchStrataAndDates
)(
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    stratumNames: string[],
    status?: ObservationState[],
    orgId?: number,
    locale?: string
  ) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}_${Array.from(new Set(stratumNames)).toString()}_${status?.join(',')}`
);

export const selectScheduleObservation = (requestId: string) => (state: RootState) =>
  state.scheduleObservation[requestId];

export const selectRescheduleObservation = (requestId: string) => (state: RootState) =>
  state.rescheduleObservation[requestId];

// get the latest observation for a planting site
export const selectLatestObservation: (
  state: RootState,
  plantingSiteId: number,
  orgId: number,
  defaultTimeZoneId: string
) => ObservationResults | undefined = createCachedSelector(
  (state: RootState, plantingSiteId: number, orgId: number, defaultTimeZoneId: string) =>
    searchObservations(state, plantingSiteId, orgId, defaultTimeZoneId, '', [], []),
  (observationsResults: ObservationResults[] | undefined) =>
    // the order of results (as returned by the server) are in reverse completed-time order, most recent completed will show up first
    observationsResults?.filter((result: ObservationResults) => result.completedTime)?.[0]
)(
  (state: RootState, plantingSiteId: number, defaultTimeZoneId: string, orgId?: number) =>
    `${plantingSiteId}-${defaultTimeZoneId}`
);
