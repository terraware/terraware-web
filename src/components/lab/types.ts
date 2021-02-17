import { TableColumnType } from '../common/table/types';

export const TEST_COLUMNS: TableColumnType[] = [
  { key: 'startDate', name: 'Start Date', type: 'date' },
  { key: 'seedType', name: 'Seed type', type: 'string' },
  { key: 'substrate', name: 'Substrate', type: 'string' },
  { key: 'treatment', name: 'Treatment', type: 'string' },
  { key: 'seedsSown', name: 'Sown', type: 'string' },
  { key: 'staffResponsible', name: 'Staff', type: 'string' },
  { key: 'notes', name: 'Notes', type: 'notes' },
  { key: 'edit', name: '', type: 'edit' },
];

export const TEST_ENTRY_COLUMNS: TableColumnType[] = [
  { key: 'seedsGerminated', name: 'Germinated', type: 'string' },
  { key: 'recordingDate', name: 'Recording Date', type: 'date' },
  { key: 'edit', name: '', type: 'edit' },
];

export const CUT_TEST_COLUMNS: TableColumnType[] = [
  { key: 'filledSeeds', name: 'Filled seeds', type: 'number' },
  { key: 'emptySeeds', name: 'Empty seeds', type: 'number' },
  { key: 'compromisedSeeds', name: 'Compromised seeds', type: 'number' },
  { key: 'edit', name: '', type: 'edit' },
];
