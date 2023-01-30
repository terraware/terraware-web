import strings from 'src/strings';

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

export function growthForms(useLocalizedValues = false) {
  return [
    { label: strings.TREE, value: useLocalizedValues ? strings.TREE : 'Tree' },
    { label: strings.SHRUB, value: useLocalizedValues ? strings.SHRUB : 'Shrub' },
    { label: strings.FORB, value: useLocalizedValues ? strings.FORB : 'Forb' },
    { label: strings.GRAMINOID, value: useLocalizedValues ? strings.GRAMINOID : 'Graminoid' },
    { label: strings.FERN, value: useLocalizedValues ? strings.FERN : 'Fern' },
  ];
}

export function storageBehaviors(useLocalizedValues = false) {
  return [
    { label: strings.ORTHODOX, value: useLocalizedValues ? strings.ORTHODOX : 'Orthodox' },
    { label: strings.RECALCITRANT, value: useLocalizedValues ? strings.RECALCITRANT : 'Recalcitrant' },
    { label: strings.INTERMEDIATE, value: useLocalizedValues ? strings.INTERMEDIATE : 'Intermediate' },
    { label: strings.UNKNOWN, value: useLocalizedValues ? strings.UNKNOWN : 'Unknown' },
  ];
}

export function conservationStatuses() {
  return [
    { label: strings.RARE, value: 'Rare' },
    { label: strings.ENDANGERED, value: 'Endangered' },
  ];
}

export function getGrowthFormString(species: Species) {
  if (species.growthForm) {
    switch (species.growthForm) {
      case 'Fern':
        return strings.FERN;
      case 'Forb':
        return strings.FORB;
      case 'Graminoid':
        return strings.GRAMINOID;
      case 'Shrub':
        return strings.SHRUB;
      case 'Tree':
        return strings.TREE;
    }
  } else {
    return undefined;
  }
}

export function getSeedStorageBehaviorString(species: Species) {
  if (species.seedStorageBehavior) {
    switch (species.seedStorageBehavior) {
      case 'Intermediate':
        return strings.INTERMEDIATE;
      case 'Orthodox':
        return strings.ORTHODOX;
      case 'Recalcitrant':
        return strings.RECALCITRANT;
      case 'Unknown':
        return strings.UNKNOWN;
    }
  } else {
    return undefined;
  }
}

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
