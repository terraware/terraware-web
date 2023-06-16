import { createCachedSelector } from 're-reselect';
import { createSelector } from '@reduxjs/toolkit';
import { ObservationResults, ObservationPlantingZoneResults } from 'src/types/Observations';
import { RootState } from 'src/redux/rootReducer';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { mergeObservations, searchZones } from './utils';

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
