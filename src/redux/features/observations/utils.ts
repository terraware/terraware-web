import { DropdownItem } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import strings from 'src/strings';
import {
  AdHocObservationResults,
  MonitoringPlotStatus,
  ObservationMonitoringPlotResults,
  ObservationMonitoringPlotResultsPayload,
  ObservationResults,
  ObservationResultsPayload,
  ObservationSpeciesResults,
  ObservationSpeciesResultsPayload,
  ObservationStratumResults,
  ObservationStratumResultsPayload,
  ObservationSubstratumResults,
  ObservationSubstratumResultsPayload,
  PlotCondition,
} from 'src/types/Observations';
import { Species } from 'src/types/Species';
import { MultiPolygon, PlantingSite } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { regexMatch } from 'src/utils/search';

// utils

export const searchResultPlots = (search: string, plotType?: boolean, zone?: ObservationStratumResults) => {
  if ((!search.trim() && plotType === undefined) || !zone) {
    return zone;
  }
  return {
    ...zone,
    substrata: zone.substrata
      .map((subzone: ObservationSubstratumResults) => ({
        ...subzone,
        monitoringPlots: subzone.monitoringPlots.filter(
          (plot: ObservationMonitoringPlotResults) =>
            regexMatch(`${plot.monitoringPlotNumber}`, search) &&
            (plotType === undefined || plot.isPermanent === plotType)
        ),
      }))
      .filter((subzone: ObservationSubstratumResults) => subzone.monitoringPlots.length > 0),
  };
};

export const searchResultZones = (search: string, zoneNames: string[], observation?: ObservationResults) => {
  if ((!search.trim() && !zoneNames.length) || !observation) {
    return observation;
  }
  return {
    ...observation,
    strata: observation.strata.filter(
      (zone: ObservationStratumResults) =>
        (!zoneNames.length || zoneNames.includes(zone.stratumName)) && matchZone(zone, search)
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
        observation.strata.some((zone: ObservationStratumResults) => zoneNames.includes(zone.stratumName))) &&
        observation.strata.some((zone: ObservationStratumResults) => matchZone(zone, search))) ||
      matchDate(observation.completedDate ? observation.completedDate : observation.startDate, search, locale)
    );
  });
};

const matchZone = (zone: ObservationStratumResults, search: string) => regexMatch(zone.stratumName, search);
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

      const mergedZones = mergeZones(observation.strata, species, timeZone);
      const mergedSpecies = mergeSpecies(observation.species, species);

      return {
        ...observation,
        plantingSiteName: site.name,
        boundary: site.boundary,
        completedDate: observation.completedTime ? getDateDisplayValue(observation.completedTime, site.timeZone) : '',
        startDate: getDateDisplayValue(observation.startDate, site.timeZone),
        strata: mergedZones,
        species: mergedSpecies,
        timeZone,
        totalLive: getObservationSpeciesLivePlantsCount(observation.species),
        totalPlants: observation.strata.reduce((acc, curr) => acc + curr.totalPlants, 0),
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
  zoneObservations: ObservationStratumResultsPayload[],
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationStratumResults[] => {
  return zoneObservations.map((zoneObservation: ObservationStratumResultsPayload): ObservationStratumResults => {
    const monitoringPlots: ObservationMonitoringPlotResultsPayload[] = zoneObservation.substrata.flatMap(
      (subZone: ObservationSubstratumResultsPayload) => subZone.monitoringPlots
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
      stratumName: zoneObservation.name,
      completedDate: zoneObservation.completedTime
        ? getDateDisplayValue(zoneObservation.completedTime, timeZone)
        : undefined,
      species: mergeSpecies(zoneObservation.species, species),
      substrata: mergeSubzones(zoneObservation.substrata, species, timeZone),
      status,
      hasObservedPermanentPlots: zoneObservation.substrata.some((plantingSubzone) =>
        plantingSubzone.monitoringPlots.some((plot) => plot.isPermanent && plot.completedTime)
      ),
      hasObservedTemporaryPlots: zoneObservation.substrata.some((plantingSubzone) =>
        plantingSubzone.monitoringPlots.some((plot) => !plot.isPermanent && plot.completedTime)
      ),
    };
  });
};

// merge subzone
const mergeSubzones = (
  subzoneObservations: ObservationSubstratumResultsPayload[],
  species: Record<number, SpeciesValue>,
  timeZone?: string
): ObservationSubstratumResults[] => {
  return subzoneObservations.map(
    (subzoneObservation: ObservationSubstratumResultsPayload): ObservationSubstratumResults => {
      return {
        ...subzoneObservation,
        substratumName: subzoneObservation.name,
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

export const has25mPlots = (subzones: ObservationSubstratumResults[] | ObservationSubstratumResultsPayload[]) => {
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
    .filter((observation) => observation.adHocPlot)
    .map((observation: ObservationResultsPayload): AdHocObservationResults => {
      const { plantingSiteId } = observation;
      const site = sites[plantingSiteId];
      const species = speciesReverseMap([]);
      const adHocPlot = observation.adHocPlot!;
      const timeZone = site.timeZone ?? defaultTimeZone;

      const mergedZones = mergeZones(observation.strata, species, site.timeZone ?? defaultTimeZone);

      return {
        ...observation,
        adHocPlot,
        boundary: site.boundary,
        plantingSiteName: site.name,
        strata: mergedZones,
        plotName: adHocPlot.monitoringPlotName,
        plotNumber: adHocPlot.monitoringPlotNumber,
        timeZone,
        totalLive: getObservationSpeciesLivePlantsCount(adHocPlot.species),
        totalPlants: observation.strata.reduce((acc, curr) => acc + curr.totalPlants, 0),
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
    | 'NaturalRegenerationWoody'
    | 'Logging'
    | 'Fire'
    | 'Mining'
    | 'Grazing'
    | 'Infrastructure'
    | 'ElectricalLines'
    | 'SoilErosion'
    | 'DifficultAccessibility'
    | 'Contamination'
    | 'SteepSlope'
    | 'WaterBodies'
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
      return strings.FUNGUS_DISEASE;
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
    case 'NaturalRegenerationWoody': {
      return strings.NATURAL_REGENERATION_WOODY;
    }
    case 'Logging': {
      return strings.LOGGING;
    }
    case 'Fire': {
      return strings.FIRE;
    }
    case 'Mining': {
      return strings.MINING;
    }
    case 'Grazing': {
      return strings.GRAZING;
    }
    case 'Infrastructure': {
      return strings.INFRASTRUCTURE;
    }
    case 'ElectricalLines': {
      return strings.ELECTRICAL_LINES;
    }

    case 'SoilErosion': {
      return strings.SOIL_EROSION;
    }

    case 'DifficultAccessibility': {
      return strings.DIFFICULT_ACCESSIBILITY;
    }

    case 'Contamination': {
      return strings.CONTAMINATION;
    }

    case 'SteepSlope': {
      return strings.STEEP_SLOPE;
    }

    case 'WaterBodies': {
      return strings.WATER_BODIES;
    }
    default: {
      return '';
    }
  }
};

export const getPlotConditionsOptions = (
  activeLocale: string | null
): (Omit<DropdownItem, 'value'> & { value: PlotCondition })[] =>
  activeLocale
    ? [
        {
          label: getConditionString('Fungus'),
          value: 'Fungus',
        },
        {
          label: getConditionString('AnimalDamage'),
          value: 'AnimalDamage',
        },
        {
          label: getConditionString('FastGrowth'),
          value: 'FastGrowth',
        },
        {
          label: getConditionString('FavorableWeather'),
          value: 'FavorableWeather',
        },
        {
          label: getConditionString('Pests'),
          value: 'Pests',
        },
        {
          label: getConditionString('SeedProduction'),
          value: 'SeedProduction',
        },
        {
          label: getConditionString('UnfavorableWeather'),
          value: 'UnfavorableWeather',
        },
      ]
    : [];
