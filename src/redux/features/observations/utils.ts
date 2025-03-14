import getDateDisplayValue from '@terraware/web-components/utils/date';

import strings from 'src/strings';
import {
  AdHocObservationResults,
  MonitoringPlotStatus,
  ObservationMonitoringPlotResults,
  ObservationMonitoringPlotResultsPayload,
  ObservationPlantingSubzoneResults,
  ObservationPlantingSubzoneResultsPayload,
  ObservationPlantingZoneResults,
  ObservationPlantingZoneResultsPayload,
  ObservationResults,
  ObservationResultsPayload,
  ObservationSpeciesResults,
  ObservationSpeciesResultsPayload,
} from 'src/types/Observations';
import { Species } from 'src/types/Species';
import { MultiPolygon, PlantingSite } from 'src/types/Tracking';
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
            regexMatch(`${plot.monitoringPlotNumber}`, search) &&
            (plotType === undefined || plot.isPermanent === plotType)
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
  if (!search?.trim() && !zoneNames?.length) {
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

export const searchPlots = (search: string, observations?: AdHocObservationResults[]) => {
  if (!search?.trim()) {
    return observations;
  }
  return observations?.filter((observation: AdHocObservationResults) =>
    observation.adHocPlot ? regexMatch(observation.adHocPlot.monitoringPlotNumber.toString(), search) : true
  );
};

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
  ary.reduce(
    (acc, curr) => {
      const { id, name, fullName, boundary, timeZone } = curr;
      if (type === 'site') {
        acc[id] = { name, boundary, timeZone };
      } else if (type === 'subzone') {
        acc[id] = { name: fullName, boundary };
      } else {
        acc[id] = { name, boundary };
      }
      return acc;
    },
    {} as Record<number, Value>
  );

// species reverse map
const speciesReverseMap = (ary: any[]): Record<number, SpeciesValue> =>
  ary.reduce(
    (acc, curr) => {
      const { id, commonName, scientificName } = curr;
      acc[id] = { commonName, scientificName };
      return acc;
    },
    {} as Record<number, SpeciesValue>
  );

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

      const mergedZones = mergeZones(
        observation.plantingZones,
        zones,
        subzones,
        species,
        site.timeZone ?? defaultTimeZone
      );

      return {
        ...observation,
        plantingSiteName: site.name,
        boundary: site.boundary,
        completedDate: observation.completedTime ? getDateDisplayValue(observation.completedTime, site.timeZone) : '',
        startDate: getDateDisplayValue(observation.startDate, site.timeZone),
        plantingZones: mergedZones,
        species: mergeSpecies(observation.species, species),
        totalPlants: observation.plantingZones.reduce((acc, curr) => acc + curr.totalPlants, 0),
        hasObservedPermanentPlots: mergedZones.some((zone) => zone.hasObservedPermanentPlots),
        hasObservedTemporaryPlots: mergedZones.some((zone) => zone.hasObservedTemporaryPlots),
      };
    });
};

const StatusWeights: Record<MonitoringPlotStatus, number> = {
  Completed: 1,
  Claimed: 2,
  Unclaimed: 3,
  'Not Observed': 4,
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
        hasObservedPermanentPlots: zoneObservation.plantingSubzones.some((plantingSubzone) =>
          plantingSubzone.monitoringPlots.some((plot) => plot.isPermanent && plot.completedTime)
        ),
        hasObservedTemporaryPlots: zoneObservation.plantingSubzones.some((plantingSubzone) =>
          plantingSubzone.monitoringPlots.some((plot) => !plot.isPermanent && plot.completedTime)
        ),
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
        species[speciesObservation.speciesId ?? -1] || speciesObservation.speciesName
    )
    .map(
      (speciesObservation: ObservationSpeciesResultsPayload): ObservationSpeciesResults => ({
        ...speciesObservation,
        speciesCommonName:
          species[speciesObservation.speciesId ?? -1]?.commonName ?? speciesObservation.speciesName ?? '',
        speciesScientificName: species[speciesObservation.speciesId ?? -1]?.scientificName ?? '',
      })
    );
};

export const has25mPlots = (
  subzones: ObservationPlantingSubzoneResults[] | ObservationPlantingSubzoneResultsPayload[]
) => {
  return subzones
    ?.flatMap((subzone: { monitoringPlots: any[] }) => subzone.monitoringPlots.flatMap((plot) => plot.sizeMeters))
    .some((size: number) => size.toString() === '25');
};

export const mergeAdHocObservations = (
  observations: ObservationResultsPayload[],
  defaultTimeZone: string,
  plantingSites?: PlantingSite[]
): AdHocObservationResults[] => {
  const sites = reverseMap(plantingSites ?? [], 'site');

  return observations
    .filter((observation) => sites[observation.plantingSiteId])
    .map((observation: ObservationResultsPayload): AdHocObservationResults => {
      const { plantingSiteId } = observation;
      const site = sites[plantingSiteId];
      const zones = zonesReverseMap(plantingSites ?? []);
      const subzones = subzonesReverseMap(plantingSites ?? []);
      const species = speciesReverseMap([]);

      const mergedZones = mergeZones(
        observation.plantingZones,
        zones,
        subzones,
        species,
        site.timeZone ?? defaultTimeZone
      );

      return {
        ...observation,
        boundary: site.boundary,
        plantingSiteName: site.name,
        plantingZones: mergedZones,
        plotName: observation?.adHocPlot?.monitoringPlotName,
        plotNumber: observation?.adHocPlot?.monitoringPlotNumber,
        totalPlants: observation.plantingZones.reduce((acc, curr) => acc + curr.totalPlants, 0),
      };
    });
};

export const getConditionString = (
  condition:
    | 'AnimalDamage'
    | 'FastGrowth'
    | 'FavorableWeather'
    | 'Fungus'
    | 'Pests'
    | 'SeedProduction'
    | 'UnfavorableWeather'
) => {
  switch (condition) {
    case 'AnimalDamage': {
      return strings.ANIMAL_DAMAGE;
    }
    case 'FastGrowth': {
      return strings.FAST_GROWTH;
    }
    case 'FavorableWeather': {
      return strings.FAVORABLE_WEATHER;
    }
    case 'Fungus': {
      return strings.FUNGUS;
    }
    case 'Pests': {
      return strings.PESTS;
    }
    case 'SeedProduction': {
      return strings.SEED_PRODUCTION;
    }
    case 'UnfavorableWeather': {
      return strings.UNFAVORABLE_WEATHER;
    }
    default: {
      return '';
    }
  }
};
