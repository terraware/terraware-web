import { createCachedSelector } from 're-reselect';

import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import {
  Observation,
  ObservationPlantingZoneResults,
  ObservationResults,
  ObservationState,
} from 'src/types/Observations';

import { mergeObservations, searchZones } from './utils';

export const ALL_STATES: ObservationState[] = ['Completed', 'Overdue', 'InProgress'];

/**
 * Observations results selectors below
 */
export const selectObservationsResults = (state: RootState) => state.observationsResults?.observations;
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
  (state: RootState, plantingSiteId: number, status?: ObservationState[]) => selectObservationsResults(state),
  (state: RootState, plantingSiteId: number, status?: ObservationState[]) => plantingSiteId,
  (state: RootState, plantingSiteId: number, status?: ObservationState[]) => status,
  (observationsResults, plantingSiteId, status) => {
    if (plantingSiteId === -1 && !status?.length) {
      // default to completed if no status is selected
      return observationsResults?.filter((result) => result.state === 'Completed');
    }
    return observationsResults?.filter((observationResults) => {
      const matchesSite = plantingSiteId === -1 || observationResults.plantingSiteId === plantingSiteId;
      const matchesState =
        (!status?.length && observationResults.state === 'Completed') ||
        (status && status.indexOf(observationResults.state) !== -1);
      return matchesSite && matchesState;
    });
  }
)((state, plantingSiteId: number, status?: ObservationState[]) => `${plantingSiteId}_${status?.join(',')}`);

/**
 * Merge named entity information with observation results.
 * Preserves order of results.
 */
export const selectMergedPlantingSiteObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    selectPlantingSiteObservationsResults(state, plantingSiteId, status),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    selectPlantingSites(state),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    selectSpecies(state),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[]) => defaultTimeZone,

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
  (observations, plantingSites, species, defaultTimeZone) => {
    if (!observations) {
      return observations;
    }

    return mergeObservations(observations, defaultTimeZone, plantingSites, species);
  }
)(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, status?: ObservationState[]) =>
    `${plantingSiteId}_${defaultTimeZone}_${status?.join(',')}`
);

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
    status?: ObservationState[]
  ) => search,
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[]
  ) => zoneNames,
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[]
  ) => selectMergedPlantingSiteObservations(state, plantingSiteId, defaultTimeZone, status),
  searchZones
)(
  (
    state: RootState,
    plantingSiteId: number,
    defaultTimeZone: string,
    search: string,
    zoneNames: string[],
    status?: ObservationState[]
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

export const selectObservations = (state: RootState) => state.observations?.observations;
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

// get the latest observation for a planting site
export const selectLatestObservation = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZoneId: string) =>
    searchObservations(state, plantingSiteId, defaultTimeZoneId, '', []),
  (observationsResults: ObservationResults[] | undefined) =>
    // the order of results (as returned by the server) are in reverse completed-time order, most recent completed will show up first
    observationsResults?.filter((result: ObservationResults) => result.completedTime)?.[0]
)((state: RootState, plantingSiteId: number, defaultTimeZoneId: string) => `${plantingSiteId}-${defaultTimeZoneId}`);

// scheduling selectors

export const selectScheduleObservation = (state: RootState, requestId: string) =>
  (state.scheduleObservation as any)[requestId];

export const selectRescheduleObservation = (state: RootState, requestId: string) =>
  (state.rescheduleObservation as any)[requestId];

// replace observation plot selectors

export const selectReplaceObservationPlot = (state: RootState, requestId: string) =>
  (state.replaceObservationPlot as any)[requestId];

// get the current observation for a planting site
export const selectCurrentObservation = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZoneId: string) =>
    searchObservations(state, plantingSiteId, defaultTimeZoneId, '', [], ['InProgress']),
  (observationsResults: ObservationResults[] | undefined) => observationsResults?.[0]
)((state: RootState, plantingSiteId: number, defaultTimeZoneId: string) => `${plantingSiteId}-${defaultTimeZoneId}`);

// get the next observation for a planting site
export const selectNextObservation = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZoneId: string) =>
    searchObservations(state, plantingSiteId, defaultTimeZoneId, '', [], ['Upcoming']),
  (observationsResults: ObservationResults[] | undefined) => observationsResults?.[0]
)((state: RootState, plantingSiteId: number, defaultTimeZoneId: string) => `${plantingSiteId}-${defaultTimeZoneId}`);
