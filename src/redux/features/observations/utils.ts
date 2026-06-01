import { DropdownItem } from '@terraware/web-components';

import strings from 'src/strings';
import {
  AdHocObservationResults,
  ObservationMonitoringPlotResults,
  ObservationResults,
  ObservationStratumResults,
  ObservationSubstratumResults,
  PlotCondition,
} from 'src/types/Observations';
import { MultiPolygon } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';
import { regexMatch } from 'src/utils/search';

// utils

export const searchResultPlots = (search: string, plotType?: boolean, stratum?: ObservationStratumResults) => {
  if ((!search.trim() && plotType === undefined) || !stratum) {
    return stratum;
  }
  return {
    ...stratum,
    substrata: stratum.substrata
      .map((substratum: ObservationSubstratumResults) => ({
        ...substratum,
        monitoringPlots: substratum.monitoringPlots.filter(
          (plot: ObservationMonitoringPlotResults) =>
            regexMatch(`${plot.monitoringPlotNumber}`, search) &&
            (plotType === undefined || plot.isPermanent === plotType)
        ),
      }))
      .filter((substratum: ObservationSubstratumResults) => substratum.monitoringPlots.length > 0),
  };
};

export const searchResultStrata = (search: string, stratumNames: string[], observation?: ObservationResults) => {
  if ((!search.trim() && !stratumNames.length) || !observation) {
    return observation;
  }
  return {
    ...observation,
    strata: observation.strata.filter(
      (stratum: ObservationStratumResults) =>
        (!stratumNames.length || stratumNames.includes(stratum.stratumName)) && matchStratum(stratum, search)
    ),
  };
};

export const searchStrataAndDates = (
  search: string,
  stratumNames: string[],
  locale?: string,
  observations?: ObservationResults[]
) => {
  if (!search?.trim()) {
    return observations;
  }
  return observations?.filter((observation: ObservationResults) => {
    return (
      ((!stratumNames.length ||
        observation.strata.some((stratum: ObservationStratumResults) => stratumNames.includes(stratum.stratumName))) &&
        observation.strata.some((stratum: ObservationStratumResults) => matchStratum(stratum, search))) ||
      matchDate(observation.completedDate ? observation.completedDate : observation.startDate, search, locale)
    );
  });
};

const matchStratum = (stratum: ObservationStratumResults, search: string) => regexMatch(stratum.stratumName, search);
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

export type Value = {
  name: string;
  boundary: MultiPolygon;
  timeZone?: string;
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
