import { createCachedSelector } from 're-reselect';
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
} from 'src/types/Observations';
import { createSelector } from '@reduxjs/toolkit';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import getDateDisplayValue from '@terraware/web-components/utils/date';

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
/*
export const selectMergedPlantingSiteObservations = createCachedSelector(
  (state: RootState, plantingSiteId: number) => selectPlantingSiteObservationsResults(state, plantingSiteId),
  (state: RootState, plantingSiteId: number) => selectPlantingSites(state),
  (state: RootState, plantingSiteId: number) => selectSpecies(state),

  // here we have the responses from first three selectors
  // merge the results so observations results have names and boundaries and time zones applied
  (observations, plantingSites, species) => {
    const sitesMap = reverseMap(plantingSites ?? [], 'site');
    const zonesMap = zonesReverseMap(plantingSites ?? []);
    const subzonesMap = subzonesReverseMap(plantingSites ?? []);
    const speciesMap = reverseMap(species ?? [], 'species');

    return mergeObservation(observations, sitesMap, zonesMap, subzonesMap, speciesMap);
  }
)((state: RootState, plantingSiteId: number) => plantingSiteId); // planting site id is the key for the cache

// add more selectors for drill down views, as needed

// utils

type SpeciesValue = { name: string };
type Value = {
  name: string;
  boundary: MultiPolygon;
  timeZone?: string;
};
const EMPTY_VALUE: Value = { name: '', boundary: [] };

// get zones reverse map
const zonesReverseMap = (sites: PlantingSite[]): Record<number, Value> =>
  reverseMap(sites.filter((site) => site.plantingZones).flatMap((site) => site.plantingZones));

// get subzones reverse map
const subzonesReverseMap = (sites: PlantingSite[]): Record<number, Value> =>
  reverseMap(
    sites
      .filter((site) => site.plantingZones)
      .flatMap((site) => site.plantingZones)
      .filter((zone) => site.plantingSubzones)
      .flatMap((zone) => site.plantingSubzones)
  );

// reverse map of id to name, boundary (for planting site, zone, subzone), optionally just name for species
const reverseMap = (ary: any[], type = 'site' | 'zone' | undefined): Record<number, any> =>
  ary.reduce((acc, curr) => {
    const { id, name, boundary, timeZone } = curr;
    if (type === 'species') {
      acc[id] = { name };
    } else {
      if (type === 'site') {
        acc[id] = { name, boundary, timeZone };
      } else {
        acc[id] = { name, boundary };
      }
    }
    return acc;
  }, {} as Record<number, any>);

// merge observation
const mergeObservation = (
  observations: ObservationResultsPayload[],
  sites: Record<number, Value>,
  zones: Record<number, Value>,
  subzones: Record<number, Value>,
  species: Record<number, SpeciesValue>
): ObservationResults[] => {
  const { plantingSiteId } = observation;
  const site = sites[plantingSiteId] || EMPTY_VALUE;

  return observations.map(
    (observation: ObservationResultsPayload): ObservationResults => ({
      ...observation,
      plantingSiteName: site.name,
      boundary: site.boundary,
      completedTime: observation.completedTime ? getDateDisplayValue(observation.completedTime, timeZone) : undefined,
      plantingZones: observation.plantingZones.map((zone: ObservationPlantingZoneResultsPayload) =>
        mergeZone(zone, zones, subzones, species, timeZone)
      ),
    })
  );
};

// merge zone
const mergeZone = (
  zoneObservations: ObservationPlantingZoneResultsPayload,
  zones: Record<number, Value>,
  subzones: Record<number, Value>,
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationPlantingZoneResults[] => {
  const { plantingZoneId } = zoneObservation;
  const zone = zones[plantingZoneId] || EMPTY_VALUE;

  return zoneObservations.map(
    (zoneObservation: ObservationPlantingZoneResultsPayload): ObservationPlantingZoneResults => ({
      ...zoneObservation,
      name: zone.name,
      boundary: zone.boundary,
      completedTime: zoneObservation.completedTime
        ? getDateDisplayValue(zoneObservation.completedTime, timeZone)
        : undefined,
      species: mergeSpecies(zone.species, species),
      plantingSubzones: mergeSubzone(zone.plantingSubzones, subzone, subzones, species, timeZone),
    })
  );
};

// merge subzone
const mergeSubzone = (
  subzoneObservations: ObservationPlantingSubzoneResultsPayload[],
  subzones: Record<number, Value>,
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationPlantingSubzoneResults[] => {
  const { plantingSubzoneId } = subzoneObservation;
  const subzone = subzones[plantingSubzoneId] || EMPTY_VALUE;

  return subzoneObservations.map(
    (subzonObservation: ObservationPlantingSubzoneResultsPayload): ObservationPlantingSubzoneResults => ({
      ...subZone,
      plantingSubzoneName: subzone.name,
      boundary: subzone.boundary,
      monitoringPlots: subZone.monitoringPlots.map((monitoringPlot: ObservationMonitoringPlotResults) => {
        return {
          ...monitoringPlot,
          species: mergeSpecies(monitoringPlot.species, species),
          completedTime: monitoringPlot.completedTime
            ? getDateDisplayValue(monitoringPlot.completedTime, timeZone)
            : undefined,
        };
      }),
    })
  );
};

const mergeSpecies = (
  speciesObservation: ObservationSpeciesResultsPayload[],
  species: Record<number, SpeciesValue>
): ObservationSpeciesPayload[] => {
  return speciesObservations.map(
    (speciesObservation: ObservationSpeciesResultsPayload): ObservationSpeciesPayload => ({
      ...speciesObservation,
      speciesName: species[speciesObservation.speciesId] ?? '',
    })
  );
};
*/
