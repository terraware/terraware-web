import { TableColumnType } from '../common/table/types';

export const COLUMNS: TableColumnType[] = [
  { key: 'startDate', name: 'Start Date', type: 'date' },
  { key: 'seedType', name: 'Seed type', type: 'string' },
  { key: 'substrate', name: 'Substrate', type: 'string' },
  { key: 'treatment', name: 'Treatment', type: 'string' },
  { key: 'seedsSown', name: 'Sown', type: 'string' },
  { key: 'seedsGerminated', name: 'Germinated', type: 'string' },
  { key: 'recordingDate', name: 'Recording Date', type: 'date' },
  { key: 'notes', name: 'Notes', type: 'notes' },
  { key: 'edit', name: '', type: 'edit' },
];
