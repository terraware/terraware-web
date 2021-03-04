import { SearchField } from '../../api/types/search';
import { TableColumnType } from '../common/table/types';

export interface Option {
  label: string | null;
  value: string | null;
}

type DatabaseColumnFilterType =
  | 'multiple_selection'
  | 'single_selection'
  | 'search'
  | 'date_range'
  | 'number_range';
export interface DatabaseColumn extends Omit<TableColumnType, 'key'> {
  key: SearchField;
  filter?: { type: DatabaseColumnFilterType, options?: Option[] }
}

export const COLUMNS: DatabaseColumn[] = [
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
    name: 'Received on',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'collectedDate',
    name: 'Collected on',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'primaryCollector',
    name: 'Collector',
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'siteLocation',
    name: 'Site location',
    type: 'string',
    filter: { type: 'search' },
  },
  {
    key: 'endangered',
    name: 'Endangered',
    type: 'boolean',
    filter: {
      type: 'single_selection',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  },
  {
    key: 'rare',
    name: 'Rare',
    type: 'boolean',
    filter: {
      type: 'single_selection',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  },
  {
    key: 'treesCollectedFrom',
    name: 'Trees collected from',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'estimatedSeedsIncoming',
    name: 'Estimated seeds incoming',
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
    name: 'Processing start date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'dryingStartDate',
    name: 'Drying start date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'processingMethod',
    name: 'Processing method',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'dryingEndDate',
    name: 'Drying end date',
    type: 'string',
    filter: { type: 'date_range' },
  },
  {
    key: 'seedsCounted',
    name: 'Number of seeds counted',
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'processingNotes', name: 'Notes', type: 'notes' },
  {
    key: 'storageStartDate',
    name: 'Storing start date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'storageCondition',
    name: 'Storage condition',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'storageLocation',
    name: 'Storage location',
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
    name: 'Date of withdrawal',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'withdrawalSeeds',
    name: 'Number of seeds withdrawn',
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
    name: 'Germination test type',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'germinationSeedType',
    name: 'Seed type',
    type: 'string',
    filter: { type: 'single_selection' },
  },
  {
    key: 'germinationTreatment',
    name: 'Germination treatment',
    type: 'string',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'cutTestSeedsFilled',
    name: 'Number of seeds filled',
    type: 'number',
    filter: { type: 'number_range' },
  },
  { key: 'germinationTestNotes', name: 'Notes', type: 'notes' },
  {
    key: 'germinationStartDate',
    name: 'Germination start date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'germinationSeedsSown',
    name: 'Number of seeds sown',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'germinationSeedsGerminated',
    name: 'Total of seeds germinated',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'cutTestSeedsEmpty',
    name: 'Number of seeds empty',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'latestGerminationTestDate',
    name: 'Most recent germination test date',
    type: 'date',
    filter: { type: 'date_range' },
  },
  {
    key: 'germinationSubstrate',
    name: 'Germination substrate',
    type: 'number',
    filter: { type: 'multiple_selection' },
  },
  {
    key: 'germinationPercentGerminated',
    name: 'Total % of seeds germinated',
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
    name: 'Most recent % viability',
    type: 'number',
    filter: { type: 'number_range' },
  },
  {
    key: 'totalViabilityPercent',
    name: 'Total estimated % viability',
    type: 'number',
    filter: { type: 'number_range' },
  },
];

export interface Preset {
  name: string;
  fields: SearchField[]
}

export const defaultPreset: Preset = {
  name: 'Default',
  fields: [
    'accessionNumber', 'species', 'siteLocation', 'state', 'collectedDate', 'receivedDate'
  ]
}

const generalInventoryPreset: Preset = {
  name: 'General Inventory',
  fields: [
    'accessionNumber', 'species', 'siteLocation', 'landowner', 'active', 'state', 'collectedDate', 'receivedDate',
    'primaryCollector', 'endangered', 'rare', 'treesCollectedFrom', 'estimatedSeedsIncoming', 'storageCondition',
    'withdrawalSeeds', 'seedsRemaining', 'latestGerminationTestDate', 'latestViabilityPercent', 'totalViabilityPercent'
  ]
}


const seedStoragePreset: Preset = {
  name: 'Seed Storage Status',
  fields: [
    'accessionNumber', 'species', 'active', 'state', 'collectedDate', 'receivedDate', 'estimatedSeedsIncoming',
    'storageStartDate', 'storagePackets', 'storageCondition', 'storageLocation', 'storageNotes', 'seedsRemaining',
    'latestViabilityPercent'
  ]
}

const viabilitySummaryPreset: Preset = {
  name: 'Viability Summary',
  fields: [
    'accessionNumber', 'species', 'active', 'state', 'collectedDate', 'germinationTestType', 'germinationSeedType',
    'germinationSeedsSown', 'germinationSubstrate', 'germinationTreatment', 'germinationTestNotes', 'germinationSeedsGerminated',
    'germinationPercentGerminated', 'cutTestSeedsFilled', 'cutTestSeedsEmpty', 'cutTestSeedsCompromised', 'latestViabilityPercent',
    'totalViabilityPercent'
  ]

}

const germinationTestingPreset: Preset = {
  name: 'Germination Testing To Do',
  fields: [
    'accessionNumber', 'species', 'active', 'state', 'collectedDate', 'storagePackets', 'storageCondition', 'storageLocation',
    'storageNotes', 'germinationTestType', 'germinationStartDate'
  ]

}

export const searchPresets = [
  defaultPreset,
  generalInventoryPreset,
  seedStoragePreset,
  viabilitySummaryPreset,
  germinationTestingPreset
]