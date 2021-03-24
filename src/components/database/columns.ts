import { SearchField } from '../../api/types/search';
import { TableColumnType } from '../common/table/types';

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
  | 'number_range';
export interface DatabaseColumn extends Omit<TableColumnType, 'key'> {
  key: SearchField;
  filter?: { type: DatabaseColumnFilterType; options?: Option[] };
}

const COLUMNS: DatabaseColumn[] = [
  {
    key: 'accessionNumber',
    name: 'Accession',
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'active',
    name: 'Status',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'state',
    name: 'State',
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'species',
    name: 'Species',
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'receivedDate',
    name: 'Received Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'collectedDate',
    name: 'Collected Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'primaryCollector',
    name: 'Collector Name',
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'siteLocation',
    name: 'Site Location',
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'endangered2',
    name: 'Endangered',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'rare2',
    name: 'Rare',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'treesCollectedFrom',
    name: '# of Trees',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'estimatedSeedsIncoming',
    name: 'Estimated Seeds Incoming',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'landowner',
    name: 'Landowner',
    type: 'string',
    filter: { type: 'search' },
  },
  { key: 'collectionNotes', name: 'Notes', type: 'notes' },
  {
    key: 'processingStartDate',
    name: 'Processing Start Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'dryingStartDate',
    name: 'Drying Start Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'processingMethod',
    name: 'Processing Method',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'dryingEndDate',
    name: 'Drying End Date',
    type: 'string',
    filter: { type: 'date_range' },
  },
  {
    key: 'seedsCounted',
    name: 'Number of Seeds Counted',
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'processingNotes', name: 'Notes', type: 'notes' },
  {
    key: 'storageStartDate',
    name: 'Storing Start Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'storageCondition',
    name: 'Storage Condition',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'storageLocation',
    name: 'Storage Location',
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'storagePackets',
    name: 'Number of storage packets',
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'storageNotes', name: 'Notes', type: 'notes' },
  {
    key: 'withdrawalDate',
    name: 'Date of Withdrawal',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'withdrawalSeeds',
    name: 'Number of Seeds Withdrawn',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'withdrawalDestination',
    name: 'Destination',
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  { key: 'seedsRemaining', name: 'Number of seeds remaining', type: 'number' },
  {
    key: 'withdrawalPurpose',
    name: 'Purpose',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'targetStorageCondition',
    name: 'Target %RH',
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  { key: 'withdrawalNotes', name: 'Notes', type: 'notes' },
  {
    key: 'germinationTestType',
    name: 'Germination Test Type',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'germinationSeedType',
    name: 'Seed Type',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'germinationTreatment',
    name: 'Germination Treatment',
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'cutTestSeedsFilled',
    name: 'Number of Seeds Filled',
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'germinationTestNotes', name: 'Notes', type: 'notes' },
  {
    key: 'germinationStartDate',
    name: 'Germination Start Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'germinationSeedsSown',
    name: 'Number of Seeds Sown',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'germinationSeedsGerminated',
    name: 'Total of Seeds Germinated',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'cutTestSeedsEmpty',
    name: 'Number of Seeds Empty',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'latestGerminationTestDate',
    name: 'Most Recent Germination Test Date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'germinationSubstrate',
    name: 'Germination Substrate',
    type: 'number',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'germinationPercentGerminated',
    name: 'Total % of Seeds Germinated',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'cutTestSeedsCompromised',
    name: 'Number of seeds compromised',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'latestViabilityPercent',
    name: 'Most Recent % Viability',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'totalViabilityPercent',
    name: 'Total Estimated % Viability',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'bagNumber',
    name: 'Bag IDs',
    type: 'string',
    filter: { type: 'search' },
  },
];

export const COLUMNS_INDEXED = COLUMNS.reduce((acum, value) => {
  acum[value.key] = value;
  return acum;
}, {} as Record<SearchField, DatabaseColumn>);

export interface Preset {
  name: string;
  fields: SearchField[];
}

export const defaultPreset: Preset = {
  name: 'Default',
  fields: [
    'accessionNumber',
    'species',
    'siteLocation',
    'state',
    'collectedDate',
    'receivedDate',
    'primaryCollector',
  ],
};

const generalInventoryPreset: Preset = {
  name: 'General Inventory',
  fields: [
    'accessionNumber',
    'species',
    'siteLocation',
    'landowner',
    'active',
    'state',
    'collectedDate',
    'receivedDate',
    'primaryCollector',
    'endangered2',
    'rare2',
    'treesCollectedFrom',
    'estimatedSeedsIncoming',
    'storageCondition',
    'withdrawalSeeds',
    'seedsRemaining',
    'latestGerminationTestDate',
    'latestViabilityPercent',
    'totalViabilityPercent',
  ],
};

const seedStoragePreset: Preset = {
  name: 'Seed Storage Status',
  fields: [
    'accessionNumber',
    'species',
    'active',
    'state',
    'collectedDate',
    'receivedDate',
    'estimatedSeedsIncoming',
    'storageStartDate',
    'storagePackets',
    'storageCondition',
    'storageLocation',
    'storageNotes',
    'seedsRemaining',
    'latestViabilityPercent',
  ],
};

const viabilitySummaryPreset: Preset = {
  name: 'Viability Summary',
  fields: [
    'accessionNumber',
    'species',
    'active',
    'state',
    'collectedDate',
    'germinationTestType',
    'germinationSeedType',
    'germinationSeedsSown',
    'germinationSubstrate',
    'germinationTreatment',
    'germinationTestNotes',
    'germinationSeedsGerminated',
    'germinationPercentGerminated',
    'cutTestSeedsFilled',
    'cutTestSeedsEmpty',
    'cutTestSeedsCompromised',
    'latestViabilityPercent',
    'totalViabilityPercent',
  ],
};

const germinationTestingPreset: Preset = {
  name: 'Germination Testing To Do',
  fields: [
    'accessionNumber',
    'species',
    'active',
    'state',
    'collectedDate',
    'storagePackets',
    'storageCondition',
    'storageLocation',
    'storageNotes',
    'germinationTestType',
    'germinationStartDate',
  ],
};

export const searchPresets = [
  defaultPreset,
  generalInventoryPreset,
  seedStoragePreset,
  viabilitySummaryPreset,
  germinationTestingPreset,
];
