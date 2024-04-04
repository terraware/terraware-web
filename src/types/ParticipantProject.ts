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
