import { Species } from 'src/types/Species';

export type SpeciesSearchResultRow = Omit<
  Species,
  'growthForms' | 'seedStorageBehavior' | 'ecosystemTypes' | 'conservationCategory' | 'rare'
> & {
  conservationCategory?: string;
  growthForms?: string[];
  acceleratorProjects?: string[];
  rare?: boolean;
  seedStorageBehavior?: string;
  ecosystemTypes?: string[];
};
