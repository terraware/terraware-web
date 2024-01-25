import { Species } from 'src/types/Species';

export type SpeciesSearchResultRow = Omit<
  Species,
  'growthForm' | 'seedStorageBehavior' | 'ecosystemTypes' | 'conservationCategory' | 'rare'
> & {
  conservationCategory?: string;
  growthForm?: string;
  rare?: string;
  seedStorageBehavior?: string;
  ecosystemTypes?: string[];
};
