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
  MonitoringPlotStatus,
} from 'src/types/Observations';
import { regexMatch } from 'src/utils/search';

// utils

export const searchResultPlots = (search: string, plotType?: boolean, zone?: ObservationPlantingZoneResults) => {
  if ((!search.trim() && plotType === undefined) || !zone) {
    return zone;
  }
  return {
    ...zone,
    plantingSubzones: zone.plantingSubzones
      .map((subzone: ObservationPlantingSubzoneResults) => ({
        ...subzone,
        monitoringPlots: subzone.monitoringPlots.filter(
          (plot: ObservationMonitoringPlotResults) =>
            regexMatch(plot.monitoringPlotName, search) && (plotType === undefined || plot.isPermanent === plotType)
        ),
      }))
      .filter((subzone: ObservationPlantingSubzoneResults) => subzone.monitoringPlots.length > 0),
  };
};

export const searchResultZones = (search: string, zoneNames: string[], observation?: ObservationResults) => {
  if ((!search.trim() && !zoneNames.length) || !observation) {
    return observation;
  }
  return {
    ...observation,
    plantingZones: observation.plantingZones.filter(
      (zone: ObservationPlantingZoneResults) =>
        (!zoneNames.length || zoneNames.includes(zone.plantingZoneName)) && matchZone(zone, search)
    ),
  };
};

export const searchZones = (search: string, zoneNames: string[], observations?: ObservationResults[]) => {
  if (!search.trim() && !zoneNames.length) {
    return observations;
  }
  return observations?.filter(
    (observation: ObservationResults) =>
      (!zoneNames.length ||
        observation.plantingZones.some((zone: ObservationPlantingZoneResults) =>
          zoneNames.includes(zone.plantingZoneName)
        )) &&
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
        completedDate: getDateDisplayValue(observation.completedTime!, site.timeZone),
        plantingZones: mergeZones(
          observation.plantingZones,
          zones,
          subzones,
          species,
          site.timeZone ?? defaultTimeZone
        ),
        species: mergeSpecies(observation.species, species),
      };
    });
};

const StatusWeights: Record<MonitoringPlotStatus, number> = {
  Completed: 1,
  InProgress: 2,
  Outstanding: 3,
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

      const monitoringPlots: ObservationMonitoringPlotResultsPayload[] = zoneObservation.plantingSubzones.flatMap(
        (subZone: ObservationPlantingSubzoneResultsPayload) => subZone.monitoringPlots
      );
      const status: MonitoringPlotStatus | undefined = monitoringPlots.reduce(
        (acc: MonitoringPlotStatus | undefined, mp: ObservationMonitoringPlotResultsPayload) => {
          if (!acc || StatusWeights[mp.status] > StatusWeights[acc]) {
            return mp.status;
          } else {
            return acc;
          }
        },
        undefined
      );

      return {
        ...zoneObservation,
        plantingZoneName: zone.name,
        boundary: zone.boundary,
        completedDate: zoneObservation.completedTime
          ? getDateDisplayValue(zoneObservation.completedTime, timeZone)
          : undefined,
        species: mergeSpecies(zoneObservation.species, species),
        plantingSubzones: mergeSubzones(zoneObservation.plantingSubzones, subzones, species, timeZone),
        status,
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
              completedDate: monitoringPlot.completedTime
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
    .filter(
      (speciesObservation: ObservationSpeciesResultsPayload) =>
        speciesObservation.speciesId || speciesObservation.speciesName
    )
    .map(
      (speciesObservation: ObservationSpeciesResultsPayload): ObservationSpeciesResults => ({
        ...speciesObservation,
        speciesCommonName: speciesObservation.speciesId
          ? species[speciesObservation.speciesId].commonName
          : speciesObservation.speciesName,
        speciesScientificName: speciesObservation.speciesId ? species[speciesObservation.speciesId].scientificName : '',
      })
    );
};
