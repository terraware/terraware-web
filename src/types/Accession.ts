import strings from 'src/strings';
import { components } from 'src/api/types/generated-schema';

export type Accession = components['schemas']['AccessionPayloadV2'];

export type Withdrawal = Required<Accession>['withdrawals'][0];

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

export function nurserySubstrates() {
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
