import strings from 'src/strings';

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

export const ACCESSION_2_STATES = [
  'Awaiting Check-In',
  'Awaiting Processing',
  'Cleaning',
  'Drying',
  'In Storage',
  'Used Up',
];

export const ACCESSION_2_CREATE_STATES = [
  'Awaiting Check-In',
  'Awaiting Processing',
  'Cleaning',
  'Drying',
  'In Storage',
];

export const ACCESSION_2_COLLECTION_SOURCES = ['Wild', 'Reintroduced', 'Cultivated', 'Other'];

export const SUBSTRATES = [
  'Nursery Media',
  'Agar',
  'Paper',
  'Other',
  'Sand',
  'Media Mix',
  'Soil',
  'Moss',
  'Perlite/Vermiculite',
];

export const LAB_SUBSTRATES = ['Agar', 'Paper', 'Sand', 'Nursery Media', 'Other'];

export const NURSERY_SUBSTRATES = ['Media Mix', 'Soil', 'Sand', 'Moss', 'Perlite/Vermiculite', 'Other'];

export const TREATMENTS = ['Soak', 'Scarify', 'Chemical', 'Stratification', 'Other', 'Light'];

export const WITHDRAWAL_TYPES = ['Lab', 'Nursery'];

export const TEST_METHODS = [
  { label: strings.LAB_GERMINATION, value: 'Lab' },
  { label: strings.NURSERY_GERMINATION, value: 'Nursery' },
  // { label: strings.CUT_TEST, value: 'Cut' },
];

export const SEED_TYPES = ['Fresh', 'Stored'];
