import { Species } from 'src/types/Species';

export type SpeciesSearchResultRow = Omit<
  Species,
  'growthForms' | 'seedStorageBehavior' | 'ecosystemTypes' | 'conservationCategory' | 'rare'
> & {
  conservationCategory?: string;
  growthForms?: string[];
  acceleratorProjects?: string[];
  rare?: string;
  seedStorageBehavior?: string;
  ecosystemTypes?: string[];
};
