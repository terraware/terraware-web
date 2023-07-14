import { createCachedSelector } from 're-reselect';
import { createSelector } from '@reduxjs/toolkit';
import {
  ObservationState,
  Observation,
  ObservationResults,
  ObservationPlantingZoneResults,
} from 'src/types/Observations';
import { RootState } from 'src/redux/rootReducer';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { mergeObservations, searchZones } from './utils';
import { isAfter } from 'src/utils/dateUtils';

/**
 * Observations results selectors below
 */
export const selectObservationsResults = (state: RootState) => state.observationsResults?.observations;
export const selectObservationsResultsError = (state: RootState) => state.observationsResults?.error;

export const selectCompletedObservationsResults = createSelector(selectObservationsResults, (observationsResults) =>
  observationsResults?.filter((observationResults) => !!observationResults.completedTime)
);

export const selectPlantingSiteObservationsResults = createSelector(
  [selectCompletedObservationsResults, (state, plantingSiteId) => plantingSiteId],
  (observationsResults, plantingSiteId) =>
    plantingSiteId === -1
      ? observationsResults
      : observationsResults?.filter((observationResults) => observationResults.plantingSiteId === plantingSiteId)
);

export const selectMergedPlantingSiteObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) =>
    selectPlantingSiteObservationsResults(state, plantingSiteId),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) => selectPlantingSites(state),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) => selectSpecies(state),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string) => defaultTimeZone,

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
  (observations, plantingSites, species, defaultTimeZone) => {
    if (!observations) {
      return observations;
    }

    return mergeObservations(observations, defaultTimeZone, plantingSites, species);
  }
)((state: RootState, plantingSiteId: number, defaultTimeZone: string) => `${plantingSiteId}_${defaultTimeZone}`); // planting site id / default time zone is the key for the cache

// search observations (search planting zone name only)
export const searchObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string, zoneNames: string[]) => search,
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string, zoneNames: string[]) => zoneNames,
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string, zoneNames: string[]) =>
    selectMergedPlantingSiteObservations(state, plantingSiteId, defaultTimeZone),
  searchZones
)(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string, zoneNames: string[]) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}_${Array.from(new Set(zoneNames)).toString()}`
);

// get zone names in observations
export const selectObservationsZoneNames = createCachedSelector(
  (state: RootState, plantingSiteId: number) => selectMergedPlantingSiteObservations(state, plantingSiteId, ''),
  (observations) =>
    Array.from(
      new Set(
        (observations ?? []).flatMap((observation: ObservationResults) =>
          observation.plantingZones.map((plantingZone: ObservationPlantingZoneResults) => plantingZone.plantingZoneName)
        )
      )
    )
)((state: RootState, plantingSiteId: number) => plantingSiteId.toString());

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
  (observationsResults: ObservationResults[] | undefined) => {
    if (!observationsResults || observationsResults.length === 0) {
      return undefined;
    }
    const result = observationsResults.reduce((prev, curr) => {
      if (isAfter(prev.completedDate, curr.completedDate)) {
        return prev;
      }
      return curr;
    });
    return result.completedTime ? result : undefined;
  }
)((state: RootState, plantingSiteId: number, defaultTimeZoneId: string) => `${plantingSiteId}-${defaultTimeZoneId}`);
