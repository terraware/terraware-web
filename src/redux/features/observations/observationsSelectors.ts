/* eslint-disable @typescript-eslint/no-unused-vars */
import { createCachedSelector } from 're-reselect';

import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectOrgPlantingSites, selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import {
  Observation,
  ObservationPlantingZoneResults,
  ObservationResults,
  ObservationState,
} from 'src/types/Observations';

import { mergeAdHocObservations, mergeObservations, searchPlots, searchZones } from './utils';

export const ALL_STATES: ObservationState[] = ['Abandoned', 'Completed', 'Overdue', 'InProgress'];

/**
 * Observations results selectors below
 */
export const selectObservationsResults = (state: RootState) => state.observationsResults?.observations;
export const selectOrgObservationsResults = (orgId: number) => (state: RootState) =>
  state.observationsResults?.[orgId]?.data?.observations;
export const selectObservationsResultsError = (state: RootState) => state.observationsResults?.error;
export const selectHasObservationsResults = (state: RootState) => {
  const results = selectObservationsResults(state);
  return results !== undefined && results.filter((result) => result.state !== 'Upcoming').length > 0;
};
export const selectHasCompletedObservations = (state: RootState, plantingSiteId: number) => {
  const results = selectObservationsResults(state);
  return (
    results !== undefined &&
    results.some((result) => result.state === 'Completed' && result.plantingSiteId === plantingSiteId)
  );
};

/**
 * Select observations results, filtered down by planting site and/or observation state.
 * Preserves order of results.
 */
export const selectPlantingSiteObservationsResults = createCachedSelector(
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

export const selectPlantingSiteAdHocObservationResults = createCachedSelector(
  (state: RootState, plantingSiteId: number) => selectAdHocObservationResults(state),
  (state: RootState, plantingSiteId: number) => plantingSiteId,
  (observationsResults, plantingSiteId) => {
    if (plantingSiteId === -1) {
      return observationsResults;
    }
    return observationsResults?.filter((observationResults) => {
      const matchesSite = plantingSiteId === -1 || observationResults.plantingSiteId === plantingSiteId;
      return matchesSite;
    });
  }
)((state, plantingSiteId: number) => `${plantingSiteId}`);

/**
 * Merge named entity information with observation results.
 * Preserves order of results.
 */
export const selectMergedPlantingSiteObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[], orgId?: number) =>
    selectPlantingSiteObservationsResults(state, plantingSiteId, status, orgId),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[], orgId?: number) => {
    return orgId && orgId !== -1 ? selectOrgPlantingSites(orgId)(state) : selectPlantingSites(state);
  },
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[], orgId?: number) =>
    selectSpecies(orgId ?? -1)(state),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[], orgId?: number) =>
    defaultTimeZone,

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
  (observations, plantingSites, species, defaultTimeZone) => {
    if (!observations) {
      return observations;
    }

    return mergeObservations(observations, defaultTimeZone, plantingSites, species?.data?.species ?? []);
  }
)(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    `${plantingSiteId}_${defaultTimeZone}_${status?.join(',')}`
);

export const selectMergedPlantingSiteAdHocObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) =>
    selectPlantingSiteAdHocObservationResults(state, plantingSiteId),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) => selectPlantingSites(state),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) => defaultTimeZone,

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
  (observations, plantingSites, defaultTimeZone) => {
    if (!observations) {
      return observations;
    }

    return mergeAdHocObservations(observations, defaultTimeZone, plantingSites);
  }
)((state: RootState, plantingSiteId: number, defaultTimeZone: string) => `${plantingSiteId}_${defaultTimeZone}`);

/**
 * Search observations (search planting zone name only at this time).
 * Preserves order of results.
 */
export const searchObservations = createCachedSelector(
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    orgId?: number
  ) => search,
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    orgId?: number
  ) => zoneNames,
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    orgId?: number
  ) => selectMergedPlantingSiteObservations(state, plantingSiteId, defaultTimeZone, status, orgId),
  searchZones
)(
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    orgId?: number
  ) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}_${Array.from(new Set(zoneNames)).toString()}_${status?.join(',')}`
);

// get zone names in observations
export const selectObservationsZoneNames = createCachedSelector(
  (state: RootState, plantingSiteId: number, status?: ObservationState[]) =>
    selectMergedPlantingSiteObservations(state, plantingSiteId, '', status),
  (observations) =>
    Array.from(
      new Set(
        (observations ?? []).flatMap((observation: ObservationResults) =>
          observation.plantingZones.map((plantingZone: ObservationPlantingZoneResults) => plantingZone.plantingZoneName)
        )
      )
    )
)(
  (state: RootState, plantingSiteId: number, status?: ObservationState[]) =>
    `${plantingSiteId.toString()}_${status?.join(',')}`
);

/**
 * Add Observations related selectors below
 */

export const selectObservations = (state: RootState, adHoc?: boolean) =>
  adHoc ? state.adHocObservations?.observations : state.observations?.observations;
export const selectObservationsError = (state: RootState) => state.observations?.error;

// get an observation by id
export const selectObservation = (state: RootState, plantingSiteId: number, observationId: number) =>
  state.observations?.observations?.find(
    (observation: Observation) => observation.id === observationId && observation.plantingSiteId === plantingSiteId
  );

// get observations specific to a planting site, by optional status
export const selectPlantingSiteObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, status?: ObservationState) => selectObservations(state),
  (state: RootState, plantingSiteId: number, status?: ObservationState) => plantingSiteId,
  (state: RootState, plantingSiteId: number, status?: ObservationState) => status,
  (observations: Observation[] | undefined, plantingSiteId: number, status?: ObservationState) => {
    const data =
      plantingSiteId === -1
        ? observations
        : observations?.filter((observation: Observation) => observation.plantingSiteId === plantingSiteId);
    const byStatus = status ? data?.filter((observation: Observation) => observation.state === status) : data;

    return byStatus ?? [];
  }
)((state: RootState, plantingSiteId: number, status?: ObservationState) => `${plantingSiteId.toString()}_${status}`);

// get ad hoc observations specific to a planting site, by optional status
export const selectPlantingSiteAdHocObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, status?: ObservationState) => selectObservations(state, true),
  (state: RootState, plantingSiteId: number, status?: ObservationState) => plantingSiteId,
  (state: RootState, plantingSiteId: number, status?: ObservationState) => status,
  (observations: Observation[] | undefined, plantingSiteId: number, status?: ObservationState) => {
    const data =
      plantingSiteId === -1
        ? observations
        : observations?.filter((observation: Observation) => observation.plantingSiteId === plantingSiteId);
    const byStatus = status ? data?.filter((observation: Observation) => observation.state === status) : data;

    return byStatus ?? [];
  }
)((state: RootState, plantingSiteId: number, status?: ObservationState) => `${plantingSiteId.toString()}_${status}`);

// get the latest observation for a planting site
export const selectLatestObservation = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZoneId: string, orgId?: number) =>
    searchObservations(state, plantingSiteId, defaultTimeZoneId, '', [], [], orgId),
  (observationsResults: ObservationResults[] | undefined) =>
    // the order of results (as returned by the server) are in reverse completed-time order, most recent completed will show up first
    observationsResults?.filter((result: ObservationResults) => result.completedTime)?.[0]
)(
  (state: RootState, plantingSiteId: number, defaultTimeZoneId: string, orgId?: number) =>
    `${plantingSiteId}-${defaultTimeZoneId}`
);

// scheduling selectors

export const selectScheduleObservation = (state: RootState, requestId: string) => state.scheduleObservation[requestId];

export const selectRescheduleObservation = (state: RootState, requestId: string) =>
  state.rescheduleObservation[requestId];

// replace observation plot selectors

export const selectReplaceObservationPlot = (state: RootState, requestId: string) =>
  state.replaceObservationPlot[requestId];

export const selectPlantingSiteObservationSummaries = (requestId: string) => (state: RootState) =>
  state.plantingSiteObservationsSummaries[requestId];

export const selectPlantingSiteObservationsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteObservations[requestId];

export const selectPlantingSiteObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteObservationResults[requestId];

export const selectPlantingSiteAdHocObservationsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteAdHocObservations[requestId];

export const selectPlantingSiteAdHocObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteAdHocObservationResults[requestId];

export const selectAbandonObservation = (state: RootState, requestId: string) => state.abandonObservation[requestId];

export const selectAdHocObservationResults = (state: RootState) => state.adHocObservationResults?.observations;

export const searchAdHocObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) => search,
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) => plantingSiteId,
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) =>
    selectMergedPlantingSiteAdHocObservations(state, plantingSiteId, defaultTimeZone),
  (search, plantingSiteId, observations) => searchPlots(search, observations)
)(
  (_state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}`
);
