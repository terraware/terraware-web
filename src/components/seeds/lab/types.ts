import strings from '../../../strings';
import { TableColumnType } from '../../common/table/types';

export const TEST_COLUMNS: TableColumnType[] = [
  { key: 'startDate', name: strings.START_DATE, type: 'date' },
  { key: 'seedType', name: strings.SEED_TYPE, type: 'string' },
  { key: 'substrate', name: strings.SUBSTRATE, type: 'string' },
  { key: 'treatment', name: strings.TREATMENT, type: 'string' },
  { key: 'seedsSown', name: strings.SOWN, type: 'string' },
  { key: 'seedsRemaining', name: strings.REMAINING, type: 'string' },
  { key: 'staffResponsible', name: strings.STAFF, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'notes' },
];

export const TEST_ENTRY_COLUMNS: TableColumnType[] = [
  { key: 'seedsGerminated', name: strings.GERMINATED, type: 'string' },
  { key: 'recordingDate', name: strings.RECORDING_DATE, type: 'date' },
];

export const CUT_TEST_COLUMNS: TableColumnType[] = [
  { key: 'filledSeeds', name: strings.FILLED_SEEDS, type: 'number' },
  { key: 'emptySeeds', name: strings.EMPTY_SEEDS, type: 'number' },
  { key: 'compromisedSeeds', name: strings.COMPROMISED_SEEDS, type: 'number' },
  { key: 'edit', name: '', type: 'edit' },
];
