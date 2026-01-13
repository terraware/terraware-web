import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

// These will all change when the BE is done, some of the props might even come from different models
export type ParticipantProject = components['schemas']['ProjectAcceleratorDetailsPayload'];

export type CarbonCertifications = ParticipantProject['carbonCertifications'];

export type LandUseModelType = ParticipantProject['landUseModelTypes'][0];

export type MetricProgress = ParticipantProject['metricProgress'][0];

// Types are in the preferred sorting order:
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

export type RegionLabel = {
  region: Region;
  label: string;
};

export const REGIONS = (): RegionLabel[] => [
  { region: 'Antarctica', label: strings.REGION_ANTARCTICA },
  { region: 'East Asia & Pacific', label: strings.REGION_EAST_ASIA_PACIFIC },
  { region: 'Europe & Central Asia', label: strings.REGION_EUROPE_CENTRAL_ASIA },
  { region: 'Latin America & Caribbean', label: strings.REGION_LATIN_AMERICA_CARIBBEAN },
  { region: 'Middle East & North Africa', label: strings.REGION_MIDDLE_EAST_NORTH_AFRICA },
  { region: 'North America', label: strings.REGION_NORTH_AMERICA },
  { region: 'Oceania', label: strings.REGION_OCEANIA },
  { region: 'South Asia', label: strings.REGION_SOUTH_ASIA },
  { region: 'Sub-Saharan Africa', label: strings.REGION_SUB_SAHARAN_AFRICA },
];

export const getRegionLabel = (input: Region): string =>
  REGIONS().find((obj) => obj.region === input)?.label ?? (input as string);

export const getRegionValue = (input: string): Region | undefined =>
  REGIONS().find((obj) => obj.label === input)?.region;
