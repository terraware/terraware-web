import getDateDisplayValue from '@terraware/web-components/utils/date';
import { MultiPolygon, PlantingSite } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
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
  ObservationMonitoringPlotResults,
} from 'src/types/Observations';
import { regexMatch } from 'src/utils/search';

// utils

export const searchResultPlots = (search: string, zone?: ObservationPlantingZoneResults) => {
  if (!search.trim() || !zone) {
    return zone;
  }
  return {
    ...zone,
    plantingSubzones: zone.plantingSubzones
      .map((subzone: ObservationPlantingSubzoneResults) => ({
        ...subzone,
        monitoringPlots: subzone.monitoringPlots.filter((plot: ObservationMonitoringPlotResults) =>
          regexMatch(plot.monitoringPlotName, search)
        ),
      }))
      .filter((subzone: ObservationPlantingSubzoneResults) => subzone.monitoringPlots.length > 0),
  };
};

export const searchResultZones = (search: string, observation?: ObservationResults) => {
  if (!search.trim() || !observation) {
    return observation;
  }
  return {
    ...observation,
    plantingZones: observation.plantingZones.filter((zone: ObservationPlantingZoneResults) => matchZone(zone, search)),
  };
};

export const searchZones = (search: string, observations?: ObservationResults[]) => {
  if (!search.trim()) {
    return observations;
  }
  return observations?.filter((observation: ObservationResults) =>
    observation.plantingZones.some((zone: ObservationPlantingZoneResults) => matchZone(zone, search))
  );
};

const matchZone = (zone: ObservationPlantingZoneResults, search: string) => regexMatch(zone.plantingZoneName, search);

type SpeciesValue = {
  commonName?: string;
  scientificName: string;
};

export type Value = {
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
export const mergeObservations = (
  observations: ObservationResultsPayload[],
  defaultTimeZone: string,
  plantingSites?: PlantingSite[],
  speciesData?: Species[]
): ObservationResults[] => {
  const sites = reverseMap(plantingSites ?? [], 'site');
  const zones = zonesReverseMap(plantingSites ?? []);
  const subzones = subzonesReverseMap(plantingSites ?? []);
  const species = speciesReverseMap(speciesData ?? []);

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
