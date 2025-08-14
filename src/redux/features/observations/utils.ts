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
import { getShortDate } from 'src/utils/dateFormatter';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
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

export const searchZonesAndDates = (
  search: string,
  zoneNames: string[],
  locale?: string,
  observations?: ObservationResults[]
) => {
  if (!search?.trim()) {
    return observations;
  }
  return observations?.filter((observation: ObservationResults) => {
    return (
      ((!zoneNames.length ||
        observation.plantingZones.some((zone: ObservationPlantingZoneResults) =>
          zoneNames.includes(zone.plantingZoneName)
        )) &&
        observation.plantingZones.some((zone: ObservationPlantingZoneResults) => matchZone(zone, search))) ||
      matchDate(observation.completedDate ? observation.completedDate : observation.startDate, search, locale)
    );
  });
};

const matchZone = (zone: ObservationPlantingZoneResults, search: string) => regexMatch(zone.plantingZoneName, search);
const matchDate = (date: string, search: string, locale?: string) => {
  if (date) {
    return regexMatch(getShortDate(date, locale), search);
  }
};

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

/** Returns a map of site IDs to name, boundary, and timeZone for each site. */
const sitesReverseMap = (ary: PlantingSite[]): Record<number, Value> =>
  ary.reduce(
    (acc, curr) => {
      const { id, name, boundary, timeZone } = curr;
      if (boundary) {
        acc[id] = { name, boundary, timeZone };
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
  const sites = sitesReverseMap(plantingSites ?? []);
  const species = speciesReverseMap(speciesData ?? []);

  return observations
    .filter((observation) => sites[observation.plantingSiteId])
    .map((observation: ObservationResultsPayload): ObservationResults => {
      const { plantingSiteId } = observation;
      const site = sites[plantingSiteId];
      const timeZone = site.timeZone ?? defaultTimeZone;

      const mergedZones = mergeZones(observation.plantingZones, species, timeZone);
      const mergedSpecies = mergeSpecies(observation.species, species);

      return {
        ...observation,
        plantingSiteName: site.name,
        boundary: site.boundary,
        completedDate: observation.completedTime ? getDateDisplayValue(observation.completedTime, site.timeZone) : '',
        startDate: getDateDisplayValue(observation.startDate, site.timeZone),
        plantingZones: mergedZones,
        species: mergedSpecies,
        timeZone,
        totalLive: getObservationSpeciesLivePlantsCount(observation.species),
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

/** Merges additional data into the results of a planting zone observation. */
const mergeZones = (
  zoneObservations: ObservationPlantingZoneResultsPayload[],
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationPlantingZoneResults[] => {
  return zoneObservations.map(
    (zoneObservation: ObservationPlantingZoneResultsPayload): ObservationPlantingZoneResults => {
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
        plantingZoneName: zoneObservation.name,
        completedDate: zoneObservation.completedTime
          ? getDateDisplayValue(zoneObservation.completedTime, timeZone)
          : undefined,
        species: mergeSpecies(zoneObservation.species, species),
        plantingSubzones: mergeSubzones(zoneObservation.plantingSubzones, species, timeZone),
        status,
        hasObservedPermanentPlots: zoneObservation.plantingSubzones.some((plantingSubzone) =>
          plantingSubzone.monitoringPlots.some((plot) => plot.isPermanent && plot.completedTime)
        ),
        hasObservedTemporaryPlots: zoneObservation.plantingSubzones.some((plantingSubzone) =>
          plantingSubzone.monitoringPlots.some((plot) => !plot.isPermanent && plot.completedTime)
        ),
      };
    }
  );
};

// merge subzone
const mergeSubzones = (
  subzoneObservations: ObservationPlantingSubzoneResultsPayload[],
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationPlantingSubzoneResults[] => {
  return subzoneObservations.map(
    (subzoneObservation: ObservationPlantingSubzoneResultsPayload): ObservationPlantingSubzoneResults => {
      return {
        ...subzoneObservation,
        plantingSubzoneName: subzoneObservation.name,
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
    }
  );
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
  const sites = sitesReverseMap(plantingSites ?? []);

  return observations
    .filter((observation) => sites[observation.plantingSiteId])
    .map((observation: ObservationResultsPayload): AdHocObservationResults => {
      const { plantingSiteId } = observation;
      const site = sites[plantingSiteId];
      const species = speciesReverseMap([]);

      const mergedZones = mergeZones(observation.plantingZones, species, site.timeZone ?? defaultTimeZone);

      return {
        ...observation,
        boundary: site.boundary,
        plantingSiteName: site.name,
        plantingZones: mergedZones,
        plotName: observation?.adHocPlot?.monitoringPlotName,
        plotNumber: observation?.adHocPlot?.monitoringPlotNumber,
        totalLive: getObservationSpeciesLivePlantsCount(observation.adHocPlot?.species),
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
