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
  (state: RootState, plantingSiteId: number) => selectPlantingSiteObservationsResults(state, plantingSiteId),
  (state: RootState, plantingSiteId: number) => selectPlantingSites(state),
  (state: RootState, plantingSiteId: number) => selectSpecies(state),

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
  (observations, plantingSites, species) => {
    if (!observations) {
      return observations;
    }

    const sitesMap = reverseMap(plantingSites ?? [], 'site');
    const zonesMap = zonesReverseMap(plantingSites ?? []);
    const subzonesMap = subzonesReverseMap(plantingSites ?? []);
    const speciesMap = speciesReverseMap(species ?? []);

    return mergeObservations(observations, sitesMap, zonesMap, subzonesMap, speciesMap);
  }
)((state: RootState, plantingSiteId: number) => plantingSiteId); // planting site id is the key for the cache

// add more selectors for drill down views, as needed

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
    const { id, name, boundary, timeZone } = curr;
    if (type === 'site') {
      acc[id] = { name, boundary, timeZone };
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
  species: Record<number, SpeciesValue>
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
        completedTime: observation.completedTime
          ? getDateDisplayValue(observation.completedTime, site.timeZone)
          : undefined,
        plantingZones: mergeZones(observation.plantingZones, zones, subzones, species, site.timeZone),
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
    .filter((speciesObservation: ObservationSpeciesResultsPayload) => species[speciesObservation.speciesId])
    .map(
      (speciesObservation: ObservationSpeciesResultsPayload): ObservationSpeciesResults => ({
        ...speciesObservation,
        speciesCommonName: species[speciesObservation.speciesId].commonName,
        speciesScientificName: species[speciesObservation.speciesId].scientificName,
      })
    );
};
