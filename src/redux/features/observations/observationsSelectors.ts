/* eslint-disable @typescript-eslint/no-unused-vars */
import { createCachedSelector } from 're-reselect';

import { selectSpeciesList } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import {
  AdHocObservationResults,
  Observation,
  ObservationResults,
  ObservationResultsPayload,
  ObservationState,
  ObservationStratumResults,
} from 'src/types/Observations';

import { mergeAdHocObservations, mergeObservations, searchPlots, searchZonesAndDates } from './utils';

export const ALL_STATES: ObservationState[] = ['Abandoned', 'Completed', 'Overdue', 'InProgress'];

/**
 * Observations results selectors below
 */
export const selectObservationsResults = (state: RootState) => state.observationsResults?.observations;
export const selectOrgObservationsResults = (orgId: number) => (state: RootState) =>
  state.observationsResults?.[orgId]?.data?.observations;
export const selectObservationsResultsError = (state: RootState) => state.observationsResults?.error;
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

export const selectPlantingSiteAdHocObservationResults: (
  state: RootState,
  plantingSiteId: number
) => ObservationResultsPayload[] | undefined = createCachedSelector(
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

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
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

export const selectMergedPlantingSiteAdHocObservations: (
  state: RootState,
  plantingSiteId: number,
  defaultTimeZone: string
) => AdHocObservationResults[] | undefined = createCachedSelector(
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
 * Search observations (search planting zone name and date only at this time).
 * Preserves order of results.
 */
export const searchObservations: (
  state: RootState,
  plantingSiteId: number,
  orgId: number,
  defaultTimeZone: string,
  search: string,
  zoneNames: string[],
  status?: ObservationState[],
  locale?: string
) => ObservationResults[] | undefined = createCachedSelector(
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => search,
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => zoneNames,
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => locale,
  (
    state: RootState,
    plantingSiteId: number,
    orgId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    locale?: string
  ) => selectMergedPlantingSiteObservations(state, plantingSiteId, orgId, defaultTimeZone, status),
  searchZonesAndDates
)(
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[],
    orgId?: number,
    locale?: string
  ) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}_${Array.from(new Set(zoneNames)).toString()}_${status?.join(',')}`
);

// get zone names in observations
export const selectObservationsZoneNames: (
  state: RootState,
  plantingSiteId: number,
  orgId: number,
  status: ObservationState[]
) => string[] = createCachedSelector(
  (state: RootState, plantingSiteId: number, orgId: number, status: ObservationState[]) =>
    selectMergedPlantingSiteObservations(state, plantingSiteId, orgId, '', status),
  (observations) =>
    Array.from(
      new Set(
        (observations ?? []).flatMap((observation: ObservationResults) =>
          observation.strata.map((plantingZone: ObservationStratumResults) => plantingZone.stratumName)
        )
      )
    )
)(
  (state: RootState, plantingSiteId: number, orgId: number, status: ObservationState[]) =>
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
export const selectPlantingSiteObservations: (
  state: RootState,
  plantingSiteId: number,
  status?: ObservationState
) => Observation[] = createCachedSelector(
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
export const selectPlantingSiteAdHocObservations: (
  state: RootState,
  plantingSiteId: number,
  status?: ObservationState
) => Observation[] = createCachedSelector(
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

export const selectAdHocObservationResults = (state: RootState) => state.adHocObservationResults?.observations;

// scheduling selectors
export const selectScheduleObservation = (requestId: string) => (state: RootState) =>
  state.scheduleObservation[requestId];

export const selectRescheduleObservation = (requestId: string) => (state: RootState) =>
  state.rescheduleObservation[requestId];

// replace observation plot selector
export const selectReplaceObservationPlot = (state: RootState, requestId: string) =>
  state.replaceObservationPlot[requestId];

// abandon observation selector
export const selectAbandonObservation = (state: RootState, requestId: string) => state.abandonObservation[requestId];

// Planting site observations selectors
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

// Organization observation selectors
export const selectOrganizationObservationsRequest = (requestId: string) => (state: RootState) =>
  state.organizationObservations[requestId];
export const selectOrganizationObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.organizationObservationResults[requestId];
export const selectOrganizationAdHocObservationsRequest = (requestId: string) => (state: RootState) =>
  state.organizationAdHocObservations[requestId];
export const selectOrganizationAdHocObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.organizationAdHocObservationResults[requestId];

export const searchAdHocObservations: (
  state: RootState,
  plantingSiteId: number,
  defaultTimeZone: string,
  search: string
) => AdHocObservationResults[] | undefined = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) => search,
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) => plantingSiteId,
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) =>
    selectMergedPlantingSiteAdHocObservations(state, plantingSiteId, defaultTimeZone),
  (search, plantingSiteId, observations) => searchPlots(search, observations)
)(
  (_state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}`
);

export const selectOneObservation = (requestId: string) => (state: RootState) => state.oneObservation[requestId];

export const selectOneObservationResults = (requestId: string) => (state: RootState) =>
  state.oneObservationResults[requestId];
