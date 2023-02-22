import strings from 'src/strings';
import { DatabaseColumn } from '@terraware/web-components/components/table/types';

function columns(): DatabaseColumn[] {
  return [
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
      name: strings.STATUS,
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
      key: 'species_commonName',
      name: strings.COMMON_NAME,
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
      name: strings.COLLECTION_DATE,
      type: 'date',
      filter: { type: 'date_range' },
    },
    {
      key: 'collectionSiteName',
      name: strings.COLLECTING_SITE,
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
      key: 'collectionSource',
      name: strings.COLLECTION_SOURCE,
      type: 'string',
      filter: { type: 'single_selection' },
    },
    {
      key: 'plantsCollectedFrom',
      name: strings.NUMBER_OF_PLANTS,
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
      key: 'collectionSiteLandowner',
      name: strings.LANDOWNER,
      type: 'string',
      filter: { type: 'search' },
    },
    { key: 'collectionSiteNotes', name: strings.NOTES, type: 'notes' },
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
      key: 'processingMethod',
      name: strings.PROCESSING_METHOD,
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
    {
      key: 'storageLocation_name',
      name: strings.SUB_LOCATION,
      type: 'string',
      filter: { type: 'multiple_selection' },
    },
    {
      key: 'totalWithdrawnCount',
      name: strings.TOTAL_WITHDRAWN_COUNT,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'totalWithdrawnWeightGrams',
      name: strings.TOTAL_WITHDRAWN_WEIGHT_GRAMS,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'totalWithdrawnWeightKilograms',
      name: strings.TOTAL_WITHDRAWN_WEIGHT_KILOGRAMS,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'totalWithdrawnWeightMilligrams',
      name: strings.TOTAL_WITHDRAWN_WEIGHT_MILLIGRAMS,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'totalWithdrawnWeightOunces',
      name: strings.TOTAL_WITHDRAWN_WEIGHT_OUNCES,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'totalWithdrawnWeightPounds',
      name: strings.TOTAL_WITHDRAWN_WEIGHT_POUNDS,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'totalWithdrawnWeightQuantity',
      additionalKeys: ['totalWithdrawnWeightUnits'],
      name: strings.TOTAL_WITHDRAWN_WEIGHT_QUANTITY,
      type: 'number',
      filter: { type: 'count_weight' },
      operation: 'or',
    },
    {
      key: 'totalWithdrawnWeightUnits',
      name: strings.TOTAL_WITHDRAWN_WEIGHT_UNITS,
      type: 'string',
    },
    {
      key: 'viabilityTests_type',
      name: strings.TEST_METHOD,
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
      key: 'viabilityTests_seedsFilled',
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
      name: strings.NUMBER_OF_SEEDS_TESTED,
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
      key: 'viabilityTests_seedsEmpty',
      name: strings.NUMBER_OF_SEEDS_EMPTY,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'viabilityTests_substrate',
      name: strings.VIABILITY_SUBSTRATE,
      type: 'number',
      filter: { type: 'multiple_selection' },
    },
    {
      key: 'viabilityTests_seedsCompromised',
      name: strings.NUMBER_OF_SEEDS_COMPROMISED,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'bagNumber',
      name: strings.BAG_IDS,
      type: 'string',
      filter: { type: 'search' },
    },
    {
      key: 'facility_name',
      name: strings.SEED_BANKS,
      type: 'string',
      filter: { type: 'multiple_selection' },
    },
    {
      key: 'ageMonths',
      name: strings.AGE_MONTHS,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'ageYears',
      name: strings.AGE_YEARS,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedWeightGrams',
      name: strings.WEIGHT_GRAMS,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedWeightKilograms',
      name: strings.WEIGHT_KILOGRAMS,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedWeightMilligrams',
      name: strings.WEIGHT_MILLIGRAMS,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedWeightOunces',
      name: strings.WEIGHT_OUNCES,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedWeightPounds',
      name: strings.WEIGHT_POUNDS,
      type: 'string',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedCount',
      name: strings.COUNT,
      type: 'string',
      filter: { type: 'number_range' },
    },
  ];
}

export function columnsIndexed(): Record<string, DatabaseColumn> {
  return columns().reduce((acum, value) => {
    acum[value.key] = value;

    return acum;
  }, {} as Record<string, DatabaseColumn>);
}

export interface Preset {
  name: string;
  fields: string[];
}

export const defaultPreset = (system?: string): Preset => {
  return {
    name: 'Default',
    fields: [
      'accessionNumber',
      'speciesName',
      'state',
      'collectionSiteName',
      'collectedDate',
      'ageMonths',
      system === 'imperial' ? 'estimatedWeightOunces' : 'estimatedWeightGrams',
      'estimatedCount',
    ],
  };
};

const generalInventoryPreset: Preset = {
  name: 'General Inventory',
  fields: [
    'accessionNumber',
    'speciesName',
    'collectionSiteName',
    'collectionSiteLandowner',
    'active',
    'state',
    'collectedDate',
    'receivedDate',
    'species_endangered',
    'species_rare',
    'plantsCollectedFrom',
    'estimatedSeedsIncoming',
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
    'storageLocation_name',
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
    'viabilityTests_seedsFilled',
    'viabilityTests_seedsEmpty',
    'viabilityTests_seedsCompromised',
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
    'storageLocation_name',
    'viabilityTests_type',
    'viabilityTests_startDate',
  ],
};

export const searchPresets = (preferredWeightSystem: string) => {
  return [
    defaultPreset(preferredWeightSystem),
    generalInventoryPreset,
    seedStoragePreset,
    viabilitySummaryPreset,
    germinationTestingPreset,
  ];
};

export const RIGHT_ALIGNED_COLUMNS = ['ageMonths', 'ageYears', 'estimatedWeightGrams', 'estimatedCount'];
