import strings from 'src/strings';
import { TableColumnType } from 'src/components/common/table/types';

export interface Option {
  label: string | null;
  value: string | null;
  disabled: boolean;
}

type DatabaseColumnFilterType =
  | 'multiple_selection'
  | 'single_selection'
  | 'search'
  | 'date_range'
  | 'number_range'
  | 'count_weight';

export interface DatabaseColumn extends Omit<TableColumnType, 'key'> {
  key: string;
  additionalKeys?: string[];
  filter?: { type: DatabaseColumnFilterType; options?: Option[] };
  operation?: 'or' | 'and' | 'field' | 'not';
}

const COLUMNS: DatabaseColumn[] = [
  {
    key: 'accessionNumber',
    name: strings.ACCESSION,
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'active',
    name: strings.ACTIVE_INACTIVE,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'state',
    name: strings.STAGE,
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'speciesName',
    name: strings.SPECIES,
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'receivedDate',
    name: strings.RECEIVED_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'collectedDate',
    name: strings.COLLECTED_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'primaryCollectorName',
    name: strings.PRIMARY_COLLECTOR,
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'siteLocation',
    name: strings.SITE_LOCATION,
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'species_endangered',
    name: strings.ENDANGERED,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'species_rare',
    name: strings.RARE,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'sourcePlantOrigin',
    name: strings.WILD_OUTPLANT,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'treesCollectedFrom',
    name: strings.NUMBER_OF_TREES,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'estimatedSeedsIncoming',
    name: strings.ESTIMATED_SEEDS_INCOMING,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'species_familyName',
    name: strings.FAMILY,
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'landowner',
    name: strings.LANDOWNER,
    type: 'string',
    filter: { type: 'search' },
  },
  { key: 'collectionNotes', name: strings.NOTES, type: 'notes' },
  {
    key: 'totalQuantity',
    additionalKeys: ['totalUnits'],
    name: strings.SEEDS_TOTAL,
    type: 'number',
    filter: { type: 'count_weight' },
    operation: 'or',
  },
  {
    key: 'totalUnits',
    name: strings.SEEDS_UNITS,
    type: 'string',
  },
  {
    key: 'processingStartDate',
    name: strings.PROCESSING_START_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'dryingStartDate',
    name: strings.DRYING_START_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'processingMethod',
    name: strings.PROCESSING_METHOD,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'viabilityTestType',
    name: strings.VIABILITY_TEST_TYPE,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'dryingEndDate',
    name: strings.DRYING_END_DATE,
    type: 'string',
    filter: { type: 'date_range' },
  },
  {
    key: 'remainingQuantity',
    additionalKeys: ['remainingUnits'],
    name: strings.SEEDS_REMAINING,
    type: 'number',
    filter: { type: 'count_weight' },
    operation: 'or',
  },
  {
    key: 'remainingUnits',
    name: strings.REMAINING_UNITS,
    type: 'string',
  },
  { key: 'processingNotes', name: strings.NOTES, type: 'notes' },
  {
    key: 'storageStartDate',
    name: strings.STORING_START_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'storageCondition',
    name: strings.STORAGE_CONDITION,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'storageLocationName',
    name: strings.STORAGE_LOCATION,
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'storagePackets',
    name: strings.NUMBER_OF_STORAGE_PACKETS,
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'storageNotes', name: strings.NOTES, type: 'notes' },
  {
    key: 'withdrawalQuantity',
    additionalKeys: ['withdrawalUnits'],
    name: strings.SEEDS_WITHDRAWN,
    type: 'number',
    filter: { type: 'count_weight' },
    operation: 'or',
  },
  {
    key: 'withdrawalUnits',
    name: strings.SEEDS_WITHDRAWN_UNITS,
    type: 'string',
  },
  {
    key: 'withdrawalDate',
    name: strings.DATE_OF_WITHDRAWAL,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'withdrawalDestination',
    name: strings.DESTINATION,
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'withdrawalPurpose',
    name: strings.PURPOSE,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'targetStorageCondition',
    name: strings.TARGET_RH,
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  { key: 'withdrawalNotes', name: strings.NOTES, type: 'notes' },
  {
    key: 'viabilityTests_type',
    name: strings.VIABILITY_TEST_TYPE,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'viabilityTests_seedType',
    name: strings.SEED_TYPE,
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'viabilityTests_treatment',
    name: strings.VIABILITY_TREATMENT,
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'cutTestSeedsFilled',
    name: strings.NUMBER_OF_SEEDS_FILLED,
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'viabilityTests_notes', name: strings.NOTES, type: 'notes' },
  {
    key: 'viabilityTests_startDate',
    name: strings.VIABILITY_START_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'viabilityTests_seedsSown',
    name: strings.NUMBER_OF_SEEDS_SOWN,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'viabilityTests_viabilityTestResults_seedsGerminated',
    name: strings.TOTAL_OF_SEEDS_GERMINATED,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'cutTestSeedsEmpty',
    name: strings.NUMBER_OF_SEEDS_EMPTY,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'latestViabilityTestDate',
    name: strings.MOST_RECENT_VIABILITY_TEST_DATE,
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'viabilityTests_substrate',
    name: strings.VIABILITY_SUBSTRATE,
    type: 'number',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'viabilityTests_percentGerminated',
    name: strings.PERCENTAGE_VIABILITY,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'cutTestSeedsCompromised',
    name: strings.NUMBER_OF_SEEDS_COMPROMISED,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'latestViabilityPercent',
    name: strings.MOST_RECENT_PERCENTAGE_VIABILITY,
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'bagNumber',
    name: strings.BAG_IDS,
    type: 'string',
    filter: { type: 'search' },
  },
];

export const COLUMNS_INDEXED = COLUMNS.reduce((acum, value) => {
  acum[value.key] = value;

  return acum;
}, {} as Record<string, DatabaseColumn>);

export interface Preset {
  name: string;
  fields: string[];
}

export const defaultPreset: Preset = {
  name: 'Default',
  fields: [
    'accessionNumber',
    'speciesName',
    'siteLocation',
    'state',
    'collectedDate',
    'receivedDate',
    'primaryCollectorName',
  ],
};

const generalInventoryPreset: Preset = {
  name: 'General Inventory',
  fields: [
    'accessionNumber',
    'speciesName',
    'siteLocation',
    'landowner',
    'active',
    'state',
    'collectedDate',
    'receivedDate',
    'primaryCollectorName',
    'species_endangered',
    'species_rare',
    'treesCollectedFrom',
    'estimatedSeedsIncoming',
    'storageCondition',
    'latestViabilityTestDate',
    'latestViabilityPercent',
  ],
};

const seedStoragePreset: Preset = {
  name: 'Seed Storage Status',
  fields: [
    'accessionNumber',
    'speciesName',
    'active',
    'state',
    'collectedDate',
    'receivedDate',
    'estimatedSeedsIncoming',
    'storageStartDate',
    'storagePackets',
    'storageCondition',
    'storageLocationName',
    'storageNotes',
    'latestViabilityPercent',
  ],
};

const viabilitySummaryPreset: Preset = {
  name: 'Viability Summary',
  fields: [
    'accessionNumber',
    'speciesName',
    'active',
    'state',
    'collectedDate',
    'viabilityTests_type',
    'viabilityTests_seedType',
    'viabilityTests_seedsSown',
    'viabilityTests_substrate',
    'viabilityTests_treatment',
    'viabilityTests_notes',
    'viabilityTests_viabilityTestResults_seedsGerminated',
    'viabilityTests_percentGerminated',
    'cutTestSeedsFilled',
    'cutTestSeedsEmpty',
    'cutTestSeedsCompromised',
    'latestViabilityPercent',
  ],
};

const germinationTestingPreset: Preset = {
  name: 'Viability Testing To Do',
  fields: [
    'accessionNumber',
    'speciesName',
    'active',
    'state',
    'collectedDate',
    'storagePackets',
    'storageCondition',
    'storageLocationName',
    'storageNotes',
    'viabilityTests_type',
    'viabilityTests_startDate',
  ],
};

export const searchPresets = [
  defaultPreset,
  generalInventoryPreset,
  seedStoragePreset,
  viabilitySummaryPreset,
  germinationTestingPreset,
];
