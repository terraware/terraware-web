export type AccessionStatus = 'active' | 'inactive';

export type AccessionState =
  | 'pending'
  | 'processing'
  | 'processed'
  | 'drying'
  | 'dried'
  | 'stored'
  | 'withdrawn';

export interface Accession {
  id?: string | null;
  species: string | null;
  family: string | null;
  trees: number | null;
  founder: string | null;
  endangered: boolean | null;
  rare: boolean | null;
  fieldNotes: string | null;
  collectedOn: string | null;
  receivedOn: string | null;
  primaryCollector: string | null;
  secondaryCollectors: string[];
  site: string | null;
  landowner: string | null;
  notes: string | null;
  status?: AccessionStatus;
  state?: AccessionState;
}