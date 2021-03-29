import strings from '../../strings';
import { TableColumnType } from '../common/table/types';

export const COLUMNS: TableColumnType[] = [
  { key: 'startDate', name: strings.START_DATE, type: 'date' },
  { key: 'endDate', name: strings.END_DATE, type: 'date' },
  { key: 'seedType', name: strings.SEED_TYPE, type: 'string' },
  { key: 'substrate', name: strings.SUBSTRATE, type: 'string' },
  { key: 'treatment', name: strings.TREATMENT, type: 'string' },
  { key: 'seedsSown', name: strings.SOWN, type: 'string' },
  { key: 'seedsGerminated', name: strings.GERMINATED, type: 'string' },
  { key: 'recordingDate', name: strings.RECORDING_DATE, type: 'date' },
  { key: 'notes', name: strings.NOTES, type: 'notes' },
  { key: 'edit', name: '', type: 'edit' },
];
