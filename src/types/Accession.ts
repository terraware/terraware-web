import strings from 'src/strings';
import { components } from 'src/api/types/generated-schema';
import { Batch } from './Batch';

export type Accession = components['schemas']['AccessionPayloadV2'];
export type ViabilityTest = components['schemas']['GetViabilityTestPayload'];
export type ViabilityTestResult = Required<components['schemas']['GetViabilityTestPayload']>['testResults'][0];
export type Withdrawal = Required<Accession>['withdrawals'][0];
export type Geolocation = components['schemas']['Geolocation'];

export const ACCESSION_STATES = [
  'Awaiting Check-In',
  'Pending',
  'Processing',
  'Processed',
  'Drying',
  'Dried',
  'In Storage',
  'Withdrawn',
  'Nursery',
];

export type AccessionState = Accession['state'];

export const ACCESSION_2_STATES: AccessionState[] = [
  'Awaiting Check-In',
  'Awaiting Processing',
  'Processing',
  'Drying',
  'In Storage',
  'Used Up',
];

export function stateName(state: AccessionState) {
  switch (state) {
    case 'Awaiting Check-In':
      return strings.AWAITING_CHECK_IN;
    case 'Awaiting Processing':
      return strings.AWAITING_PROCESSING;
    case 'Processing':
      return strings.PROCESSING;
    case 'Drying':
      return strings.DRYING;
    case 'In Storage':
      return strings.IN_STORAGE;
    case 'Used Up':
      return strings.USED_UP;
  }
}

export function accessionCreateStates() {
  return [
    { label: strings.AWAITING_CHECK_IN, value: 'Awaiting Check-In' },
    { label: strings.AWAITING_PROCESSING, value: 'Awaiting Processing' },
    { label: strings.PROCESSING, value: 'Processing' },
    { label: strings.DRYING, value: 'Drying' },
    { label: strings.IN_STORAGE, value: 'In Storage' },
  ];
}

export function labSubstrates() {
  return [
    { label: strings.AGAR, value: 'Agar' },
    { label: strings.PAPER, value: 'Paper' },
    { label: strings.SAND, value: 'Sand' },
    { label: strings.NURSERY_MEDIA, value: 'Nursery Media' },
    { label: strings.OTHER, value: 'Other' },
    { label: strings.NONE, value: 'None' },
  ];
}

export const batchSubstrateEnumToLocalized = (substrate: Batch['substrate']): string | undefined => {
  switch (substrate) {
    case 'MediaMix': {
      return strings.MEDIA_MIX;
    }
    case 'Moss': {
      return strings.MOSS;
    }
    case 'Other': {
      return strings.OTHER;
    }
    case 'PerliteVermiculite': {
      return strings.PERLITE_VERMICULITE;
    }
    case 'Sand': {
      return strings.SAND;
    }
    case 'Soil': {
      return strings.SOIL;
    }
  }
};

export const batchSubstrateLocalizedToEnum = (substrate: string): Batch['substrate'] | undefined => {
  switch (substrate) {
    case strings.MEDIA_MIX: {
      return 'MediaMix';
    }
    case strings.MOSS: {
      return 'Moss';
    }
    case strings.OTHER: {
      return 'Other';
    }
    case strings.PERLITE_VERMICULITE: {
      return 'PerliteVermiculite';
    }
    case strings.SAND: {
      return 'Sand';
    }
    case strings.SOIL: {
      return 'Soil';
    }
  }
};

export function accessionNurserySubstrates(): { label: string; value: ViabilityTest['substrate'] | null }[] {
  return [
    { label: strings.MEDIA_MIX, value: 'Media Mix' },
    { label: strings.SOIL, value: 'Soil' },
    { label: strings.SAND, value: 'Sand' },
    { label: strings.MOSS, value: 'Moss' },
    { label: strings.PERLITE_VERMICULITE, value: 'Perlite/Vermiculite' },
    { label: strings.OTHER, value: 'Other' },
    { label: strings.NONE, value: 'None' },
  ];
}

export function nurserySubstrates(): { label: string; value: Batch['substrate'] | null }[] {
  return [
    { label: strings.MEDIA_MIX, value: 'MediaMix' },
    { label: strings.SOIL, value: 'Soil' },
    { label: strings.SAND, value: 'Sand' },
    { label: strings.MOSS, value: 'Moss' },
    { label: strings.PERLITE_VERMICULITE, value: 'PerliteVermiculite' },
    { label: strings.OTHER, value: 'Other' },
    { label: strings.NONE, value: null },
  ];
}

export function nurserySubstratesLocalized(): { label: string; value: string | null }[] {
  return [
    { label: strings.MEDIA_MIX, value: strings.MEDIA_MIX },
    { label: strings.SOIL, value: strings.SOIL },
    { label: strings.SAND, value: strings.SAND },
    { label: strings.MOSS, value: strings.MOSS },
    { label: strings.PERLITE_VERMICULITE, value: strings.PERLITE_VERMICULITE },
    { label: strings.OTHER, value: strings.OTHER },
    { label: strings.NONE, value: null },
  ];
}

export function treatments() {
  return [
    { label: strings.SOAK, value: 'Soak' },
    { label: strings.SCARIFY, value: 'Scarify' },
    { label: strings.CHEMICAL, value: 'Chemical' },
    { label: strings.STRATIFICATION, value: 'Stratification' },
    { label: strings.LIGHT, value: 'Light' },
    { label: strings.OTHER, value: 'Other' },
  ];
}

export function withdrawalTypes() {
  return [
    { label: strings.LAB, value: 'Lab' },
    { label: strings.NURSERY, value: 'Nursery' },
  ];
}

export function testMethods() {
  return [
    { label: strings.LAB_GERMINATION, value: 'Lab' },
    { label: strings.NURSERY_GERMINATION, value: 'Nursery' },
    { label: strings.CUT_TEST, value: 'Cut' },
  ];
}

export function seedTypes() {
  return [
    { label: strings.FRESH, value: 'Fresh' },
    { label: strings.STORED, value: 'Stored' },
  ];
}

export type TEST_TYPES = 'Lab' | 'Nursery' | 'Cut';

export const ActiveStatuses = () => [
  strings.AWAITING_CHECK_IN,
  strings.AWAITING_PROCESSING,
  strings.PROCESSING,
  strings.DRYING,
  strings.IN_STORAGE,
];
