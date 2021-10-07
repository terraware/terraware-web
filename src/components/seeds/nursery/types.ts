import strings from 'src/strings';
import { TableColumnType } from '../../common/table/types';

export const COLUMNS: TableColumnType[] = [
  { key: 'startDate', name: strings.START_DATE, type: 'date' },
  { key: 'seedType', name: strings.SEED_TYPE, type: 'string' },
  { key: 'substrate', name: strings.SUBSTRATE, type: 'string' },
  { key: 'treatment', name: strings.TREATMENT, type: 'string' },
  { key: 'seedsSown', name: strings.SOWN, type: 'string' },
  { key: 'seedsRemaining', name: strings.REMAINING, type: 'string' },
  { key: 'seedsGerminated', name: strings.GERMINATED, type: 'string' },
  { key: 'recordingDate', name: strings.RECORDING_DATE, type: 'date' },
  { key: 'viability', name: strings.PERCENTAGE_VIABILITY, type: 'string' },
  { key: 'staffResponsible', name: strings.STAFF, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'notes' },
];
