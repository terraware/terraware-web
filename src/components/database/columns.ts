import { ACCESSION_STATE, ACCESSION_STATUS } from '../../api/types/accessions';
import { TableColumnType } from '../common/table/types';

export interface Option {
  label: string;
  value: string
}

export interface DatabaseColumn extends TableColumnType {
  filter?: { type: 'multiple_selection', options: Option[] }
}

const accessionState: Option[] = ACCESSION_STATE.map((state) => ({
  label: state, value: state
}))

const accessionStatus: Option[] = ACCESSION_STATUS.map((state) => ({
  label: state, value: state
}))

export const COLUMNS: DatabaseColumn[] = [
  { key: 'accessionNumber', name: 'ACCESSION', type: 'string' },
  { key: 'species', name: 'SPECIES', type: 'string' },
  { key: 'siteLocation', name: 'SITE LOCATION', type: 'string' },
  { key: 'active', name: 'STATUS', type: 'string', filter: { type: 'multiple_selection', options: accessionStatus } },
  { key: 'state', name: 'STATE', type: 'string', filter: { type: 'multiple_selection', options: accessionState } },
  { key: 'collectedDate', name: 'COLLECTED ON', type: 'date' },
  { key: 'receivedDate', name: 'RECEIVED ON', type: 'date' },
];
