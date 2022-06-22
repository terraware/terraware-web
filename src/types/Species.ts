export type Species = {
  id: number;
  commonName?: string;
  endangered?: boolean;
  familyName?: string;
  growthForm?: 'Tree' | 'Shrub' | 'Forb' | 'Graminoid' | 'Fern';
  scientificName: string;
  rare?: boolean;
  seedStorageBehavior?: 'Orthodox' | 'Recalcitrant' | 'Intermediate' | 'Unknown';
  problems?: SpeciesProblemElement[];
};

export type SpeciesProblemElement = {
  id: number;
  field: 'Scientific Name';
  type: 'Name Misspelled' | 'Name Not Found' | 'Name Is Synonym';
  /** Value for the field in question that would correct the problem. Absent if the system is unable to calculate a corrected value. */
  suggestedValue?: string;
};

export const GrowthForms = ['Tree', 'Shrub', 'Forb', 'Graminoid', 'Fern'];

export const StorageBehaviors = ['Orthodox', 'Recalcitrant', 'Intermediate', 'Unknown'];

export type SpeciesWithScientificName = Species & {
  scientificName?: string;
};

export type SpeciesById = Map<number, SpeciesWithScientificName>;

export enum SpeciesRequestError {
  PreexistingSpecies = 'SERVER_RETURNED_409_PREEXISTING_SPECIES',
  // Server returned any other error (3xx, 4xx, 5xxx), or server did not respond, or there was an error
  // setting up the request. In other words, there was a developer error or server outage.
  RequestFailed = 'AN_UNRECOVERABLE_ERROR_OCCURRED',
}
