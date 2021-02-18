import { ACCESSION_STATE, ACCESSION_STATUS } from '../../api/types/accessions';
import { SearchField } from '../../api/types/search';
import { TableColumnType } from '../common/table/types';

export interface Option {
  label: string;
  value: string
}

type DatabaseColumnFilterType = 'multiple_selection'
export interface DatabaseColumn extends Omit<TableColumnType, 'key'> {
  key: SearchField;
  filter?: { type: DatabaseColumnFilterType, options: Option[] }
}

const accessionState: Option[] = ACCESSION_STATE.map((state) => ({
  label: state, value: state
}))

const accessionStatus: Option[] = ACCESSION_STATUS.map((state) => ({
  label: state, value: state
}))

export const COLUMNS: DatabaseColumn[] = [
  { key: 'accessionNumber', name: 'Accession', type: 'string' },
  { key: 'active', name: 'Status', type: 'string', filter: { type: 'multiple_selection', options: accessionStatus } },
  { key: 'state', name: 'State', type: 'string', filter: { type: 'multiple_selection', options: accessionState } },
  { key: 'species', name: 'Species', type: 'string' },
  { key: 'receivedDate', name: 'Received on', type: 'date' },
  { key: 'collectedDate', name: 'Collected on', type: 'date' },
  { key: 'primaryCollector', name: 'Collector', type: 'string' },
  { key: 'siteLocation', name: 'Site location', type: 'string' },
  { key: 'endangered', name: 'Endangered', type: 'boolean' },
  { key: 'rare', name: 'Rare', type: 'boolean' },
  { key: 'treesCollectedFrom', name: 'Trees collected from', type: 'number' },
  { key: 'estimatedSeedsIncoming', name: 'Estimated seeds incoming', type: 'number' },
  { key: 'landowner', name: 'Landowner', type: 'string' },
  { key: 'collectionNotes', name: 'Notes', type: 'notes' },
  { key: 'processingStartDate', name: 'Processing start date', type: 'date' },
  { key: 'estimatedSeeds', name: 'Estimated number of seeds (weight)', type: 'number' },
  { key: 'dryingStartDate', name: 'Drying start date', type: 'date' },
  { key: 'processingMethod', name: 'Processing method', type: 'string' },
  { key: 'dryingEndDate', name: 'Drying end date', type: 'string' },
  { key: 'seedsCounted', name: 'Number of seeds counted', type: 'number' },
  { key: 'processingNotes', name: 'Notes', type: 'notes' },
  { key: 'storageStartDate', name: 'Storing start date', type: 'date' },
  { key: 'storageCondition', name: 'Storage condition', type: 'string' },
  { key: 'storageLocation', name: 'Storage location', type: 'string' },
  { key: 'storagePackets', name: 'Number of storage packets', type: 'number' },
  { key: 'storageNotes', name: 'Notes', type: 'notes' },
  { key: 'withdrawalDate', name: 'Date of withdrawal', type: 'date' },
  { key: 'withdrawalSeeds', name: 'Number of seeds withdrawn', type: 'number' },
  { key: 'withdrawalDestination', name: 'Destination', type: 'string' },
  { key: 'seedsRemaining', name: 'Number of seeds remaining', type: 'number' },
  { key: 'withdrawalPurpose', name: 'Purpose', type: 'string' },
  { key: 'targetStorageCondition', name: 'Target %RH', type: 'string' },
  { key: 'withdrawalNotes', name: 'Notes', type: 'notes' },
  { key: 'germinationTestType', name: 'Germination test type', type: 'string' },
  { key: 'germinationSeedType', name: 'Seed type', type: 'string' },
  { key: 'germinationTreatment', name: 'Germination treatment', type: 'string' },
  { key: 'cutTestSeedsFilled', name: 'Number of seeds filled', type: 'number' },
  { key: 'germinationTestNotes', name: 'Notes', type: 'notes' },
  { key: 'germinationStartDate', name: 'Germination start date', type: 'date' },
  { key: 'germinationSeedsSown', name: 'Number of seeds sown', type: 'number' },
  { key: 'germinationSeedsGerminated', name: 'Total of seeds germinated', type: 'number' },
  { key: 'cutTestSeedsEmpty', name: 'Number of seeds empty', type: 'number' },
  { key: 'latestGerminationTestDate', name: 'Most recent germination test date', type: 'date' },
  { key: 'germinationSubstrate', name: 'Germination substrate', type: 'number' },
  { key: 'germinationPercentGerminated', name: 'Total % of seeds germinated', type: 'number' },
  { key: 'cutTestSeedsCompromised', name: 'Number of seeds compromised', type: 'number' },
  { key: 'latestViabilityPercent', name: 'Most recent % viability', type: 'number' },
  { key: 'totalViabilityPercent', name: 'Total estimated % viability', type: 'number' },
];

export interface Preset {
  name: string;
  fields: SearchField[]
}

export const defaultPreset: Preset = {
  name: 'Default',
  fields: [
    'accessionNumber', 'species', 'siteLocation', 'active', 'state', 'collectedDate', 'receivedDate'
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
