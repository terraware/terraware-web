import strings from 'src/strings';
import { DatabaseColumn } from '@terraware/web-components/components/table/types';

function columns(): DatabaseColumn[] {
  return [
    {
      key: 'accessionNumber',
      name: strings.ACCESSION,
      type: 'string',
      filter: { type: 'search' },
      searchType: 'ExactOrFuzzy',
    },
    {
      key: 'state',
      name: strings.STATUS,
      type: 'string',
      filter: { type: 'multiple_selection' },
    },
    {
      key: 'facility_name',
      name: strings.SEED_BANKS,
      type: 'string',
      filter: { type: 'multiple_selection' },
    },
    {
      key: 'subLocation_name',
      name: strings.SUB_LOCATION,
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
      key: 'species_familyName',
      name: strings.FAMILY,
      type: 'string',
      filter: { type: 'search' },
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
      searchType: 'ExactOrFuzzy',
    },
    {
      key: 'collectionSiteLandowner',
      name: strings.LANDOWNER,
      type: 'string',
      filter: { type: 'search' },
    },
    { key: 'collectionSiteNotes', name: strings.NOTES, type: 'notes' },
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
      key: 'totalWithdrawnCount',
      name: strings.TOTAL_WITHDRAWN_COUNT,
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
      key: 'totalViabilityPercent',
      name: strings.VIABILITY,
      type: 'number',
      filter: { type: 'number_range' },
    },
    {
      key: 'estimatedWeightMilligrams',
      name: strings.WEIGHT_MILLIGRAMS,
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

export function orderedColumnNames(): string[] {
  return columns().map((column) => column.key);
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
  fields: ['accessionNumber', 'speciesName', 'collectionSiteName', 'collectionSiteLandowner', 'state', 'collectedDate'],
};

const seedStoragePreset: Preset = {
  name: 'Seed Storage Status',
  fields: ['accessionNumber', 'speciesName', 'state', 'collectedDate', 'facility_name', 'subLocation_name'],
};

export const searchPresets = (preferredWeightSystem: string) => {
  return [defaultPreset(preferredWeightSystem), generalInventoryPreset, seedStoragePreset];
};

export const RIGHT_ALIGNED_COLUMNS = [
  'ageMonths',
  'ageYears',
  'estimatedWeightGrams',
  'estimatedCount',
  'totalViabilityPercent',
];
