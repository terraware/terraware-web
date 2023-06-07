import { createCachedSelector } from 're-reselect';
import { createSelector } from '@reduxjs/toolkit';
import getDateDisplayValue from '@terraware/web-components/utils/date';
import { RootState } from 'src/redux/rootReducer';
import { MultiPolygon, PlantingSite } from 'src/types/Tracking';
import {
  ObservationResultsPayload,
  ObservationResults,
  ObservationPlantingZoneResultsPayload,
  ObservationPlantingZoneResults,
  ObservationPlantingSubzoneResultsPayload,
  ObservationPlantingSubzoneResults,
  ObservationSpeciesResultsPayload,
  ObservationSpeciesResults,
  ObservationMonitoringPlotResultsPayload,
} from 'src/types/Observations';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { regexMatch } from 'src/utils/search';

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

    const sitesMap = reverseMap(plantingSites ?? [], 'site');
    const zonesMap = zonesReverseMap(plantingSites ?? []);
    const subzonesMap = subzonesReverseMap(plantingSites ?? []);
    const speciesMap = speciesReverseMap(species ?? []);

    return mergeObservations(observations, sitesMap, zonesMap, subzonesMap, speciesMap, defaultTimeZone);
  }
)((state: RootState, plantingSiteId: number, defaultTimeZone: string) => `${plantingSiteId}_${defaultTimeZone}`); // planting site id / default time zone is the key for the cache

// search observations (search planting zone name only)
export const searchObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) =>
    selectMergedPlantingSiteObservations(state, plantingSiteId, defaultTimeZone),
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) => search,
  (observations, search) =>
    observations?.filter((observation: ObservationResults) => {
      return observation.plantingZones.some((zone: ObservationPlantingZoneResults) =>
        regexMatch(zone.plantingZoneName, search)
      );
    })
)(
  (state: RootState, plantingSiteId: number, defaultTimeZone: string, search: string) =>
    `${plantingSiteId}_${defaultTimeZone}_${search}`
);

// utils

type SpeciesValue = {
  commonName?: string;
  scientificName: string;
};
type Value = {
  name: string;
  boundary: MultiPolygon;
  timeZone?: string;
};

// get zones reverse map
const zonesReverseMap = (sites: PlantingSite[]): Record<number, Value> =>
  reverseMap(
    sites.filter((site) => site.plantingZones).flatMap((site) => site.plantingZones),
    'zone'
  );

// get subzones reverse map
const subzonesReverseMap = (sites: PlantingSite[]): Record<number, Value> =>
  reverseMap(
    sites
      .filter((site) => site.plantingZones)
      .flatMap((site) =>
        site.plantingZones!.filter((zone) => zone.plantingSubzones).flatMap((zone) => zone.plantingSubzones)
      ),
    'subzone'
  );

// reverse map of id to name, boundary (for planting site, zone, subzone), optionally just name for species
const reverseMap = (ary: any[], type: string): Record<number, Value> =>
  ary.reduce((acc, curr) => {
    const { id, name, fullName, boundary, timeZone } = curr;
    if (type === 'site') {
      acc[id] = { name, boundary, timeZone };
    } else if (type === 'subzone') {
      acc[id] = { name: fullName, boundary };
    } else {
      acc[id] = { name, boundary };
    }
    return acc;
  }, {} as Record<number, Value>);

// species reverse map
const speciesReverseMap = (ary: any[]): Record<number, SpeciesValue> =>
  ary.reduce((acc, curr) => {
    const { id, commonName, scientificName } = curr;
    acc[id] = { commonName, scientificName };
    return acc;
  }, {} as Record<number, SpeciesValue>);

// merge observation
const mergeObservations = (
  observations: ObservationResultsPayload[],
  sites: Record<number, Value>,
  zones: Record<number, Value>,
  subzones: Record<number, Value>,
  species: Record<number, SpeciesValue>,
  defaultTimeZone: string
): ObservationResults[] => {
  return observations
    .filter((observation) => sites[observation.plantingSiteId])
    .map((observation: ObservationResultsPayload): ObservationResults => {
      const { plantingSiteId } = observation;
      const site = sites[plantingSiteId];

      return {
        ...observation,
        plantingSiteName: site.name,
        boundary: site.boundary,
        completedTime: getDateDisplayValue(observation.completedTime!, site.timeZone),
        plantingZones: mergeZones(
          observation.plantingZones,
          zones,
          subzones,
          species,
          site.timeZone ?? defaultTimeZone
        ),
      };
    });
};

// merge zone
const mergeZones = (
  zoneObservations: ObservationPlantingZoneResultsPayload[],
  zones: Record<number, Value>,
  subzones: Record<number, Value>,
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationPlantingZoneResults[] => {
  return zoneObservations
    .filter((zoneObservation: ObservationPlantingZoneResultsPayload) => zones[zoneObservation.plantingZoneId])
    .map((zoneObservation: ObservationPlantingZoneResultsPayload): ObservationPlantingZoneResults => {
      const { plantingZoneId } = zoneObservation;
      const zone = zones[plantingZoneId];

      return {
        ...zoneObservation,
        plantingZoneName: zone.name,
        boundary: zone.boundary,
        completedTime: zoneObservation.completedTime
          ? getDateDisplayValue(zoneObservation.completedTime, timeZone)
          : undefined,
        species: mergeSpecies(zoneObservation.species, species),
        plantingSubzones: mergeSubzones(zoneObservation.plantingSubzones, subzones, species, timeZone),
      };
    });
};

// merge subzone
const mergeSubzones = (
  subzoneObservations: ObservationPlantingSubzoneResultsPayload[],
  subzones: Record<number, Value>,
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationPlantingSubzoneResults[] => {
  return subzoneObservations
    .filter(
      (subzoneObservation: ObservationPlantingSubzoneResultsPayload) => subzones[subzoneObservation.plantingSubzoneId]
    )
    .map((subzoneObservation: ObservationPlantingSubzoneResultsPayload): ObservationPlantingSubzoneResults => {
      const { plantingSubzoneId } = subzoneObservation;
      const subzone = subzones[plantingSubzoneId];

      return {
        ...subzoneObservation,
        plantingSubzoneName: subzone.name,
        boundary: subzone.boundary,
        monitoringPlots: subzoneObservation.monitoringPlots.map(
          (monitoringPlot: ObservationMonitoringPlotResultsPayload) => {
            return {
              ...monitoringPlot,
              species: mergeSpecies(monitoringPlot.species, species),
              completedTime: monitoringPlot.completedTime
                ? getDateDisplayValue(monitoringPlot.completedTime, timeZone)
                : undefined,
            };
          }
        ),
      };
    });
};

const mergeSpecies = (
  speciesObservations: ObservationSpeciesResultsPayload[],
  species: Record<number, SpeciesValue>
): ObservationSpeciesResults[] => {
  return speciesObservations
    .filter((speciesObservation: ObservationSpeciesResultsPayload) => species[speciesObservation.speciesId ?? -1])
    .map(
      (speciesObservation: ObservationSpeciesResultsPayload): ObservationSpeciesResults => ({
        ...speciesObservation,
        speciesCommonName: species[speciesObservation.speciesId ?? -1].commonName,
        speciesScientificName: species[speciesObservation.speciesId ?? -1].scientificName,
      })
    );
};
