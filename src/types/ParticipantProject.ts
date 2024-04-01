import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

import { CohortPhaseType } from './Cohort';

// These will all change when the BE is done, some of the props might even come from different models
export type ParticipantProject = components['schemas']['ProjectAcceleratorDetailsPayload'];

export type ParticipantProjectSearchResult = {
  cohortName: string;
  country: string;
  id: number;
  landUseModelType: string[];
  name: string;
  participant_cohort_id: number;
  participant_cohort_phase: CohortPhaseType;
  participantName: string;
  region: string;
  restorableLand: string;
  restorableLandRaw: number;
};

export type LandUseModelType = ParticipantProject['landUseModelTypes'][0];

export const LAND_USE_MODEL_TYPES: LandUseModelType[] = [
  'Native Forest',
  'Monoculture',
  'Sustainable Timber',
  'Other Timber',
  'Mangroves',
  'Agroforestry',
  'Silvopasture',
  'Other Land-Use Model',
];

export const getLandUseModelType = (input: LandUseModelType): string => {
  switch (input) {
    case 'Native Forest':
      return strings.NATIVE_FOREST;
    case 'Monoculture':
      return strings.MONOCULTURE;
    case 'Sustainable Timber':
      return strings.SUSTAINABLE_TIMBER;
    case 'Other Timber':
      return strings.OTHER_TIMBER;
    case 'Mangroves':
      return strings.MANGROVES;
    case 'Agroforestry':
      return strings.AGROFORESTRY;
    case 'Silvopasture':
      return strings.SILVOPASTURE;
    case 'Other Land-Use Model':
      return strings.OTHER_LAND_USE_MODEL;
  }
};

export type Region = ParticipantProject['region'];

export const REGIONS: Region[] = [
  'Antarctica',
  'East Asia & Pacific',
  'Europe & Central Asia',
  'Latin America & Caribbean',
  'Middle East & North Africa',
  'North America',
  'Oceania',
  'South Asia',
  'Sub-Saharan Africa',
];

export const getRegion = (input: Region): string => {
  switch (input) {
    case 'Antarctica':
      return strings.REGION_ANTARCTICA;
    case 'East Asia & Pacific':
      return strings.REGION_EAST_ASIA_PACIFIC;
    case 'Europe & Central Asia':
      return strings.REGION_EUROPE_CENTRAL_ASIA;
    case 'Latin America & Caribbean':
      return strings.REGION_LATIN_AMERICA_CARIBBEAN;
    case 'Middle East & North Africa':
      return strings.REGION_MIDDLE_EAST_NORTH_AFRICA;
    case 'North America':
      return strings.REGION_NORTH_AMERICA;
    case 'Oceania':
      return strings.REGION_OCEANIA;
    case 'South Asia':
      return strings.REGION_SOUTH_ASIA;
    case 'Sub-Saharan Africa':
      return strings.REGION_SUB_SAHARAN_AFRICA;
    default:
      return `${input}`;
  }
};
