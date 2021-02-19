import { components } from './generated-schema';

export type AccessionActive = components['schemas']['AccessionPayload']['active'];
export type AccessionState = components['schemas']['AccessionPayload']['state'];
export type Accession = components['schemas']['AccessionPayload'];
export type NewAccession = components['schemas']['CreateAccessionRequestPayload'];
export type AccessionWithdrawal = components['schemas']['WithdrawalPayload'];
export type ProcessingMethod = NonNullable<Accession['processingMethod']>;
export type WithdrawalPurpose = AccessionWithdrawal['purpose'];
export type TargetRH = NonNullable<Accession['targetStorageCondition']>;

export const ACCESSION_STATE: AccessionState[] = [
  'Pending',
  'Processing',
  'Processed',
  'Drying',
  'Dried',
  'In Storage',
  'Withdrawn',
];
export const ACCESSION_STATUS: AccessionActive[] = ['Inactive', 'Active'];

export const PROCESSING_METHODS: ProcessingMethod[] = ['Count', 'Weight'];

export const WITHDRAWAL_PURPOSES: WithdrawalPurpose[] = [
  'Propagation',
  'Outreach or Education',
  'Research',
  'Broadcast',
  'Share with Another Site',
  'Other',
];

export const TARGETS_RH: TargetRH[] = ['Refrigerator', 'Freezer'];
