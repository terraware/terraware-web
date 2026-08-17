import { DropdownItem } from '@terraware/web-components';

import strings from 'src/strings';
import { PlotCondition } from 'src/types/Observations';

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
