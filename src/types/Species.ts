import { components } from 'src/api/types/generated-schema';
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
  ecosystemTypes?: EcosystemType[];
};

export type EcosystemType =
  | 'Boreal forests/Taiga'
  | 'Deserts and xeric shrublands'
  | 'Flooded grasslands and savannas'
  | 'Mangroves'
  | 'Mediterranean forests, woodlands and scrubs'
  | 'Montane grasslands and shrublands'
  | 'Temperate broad leaf and mixed forests'
  | 'Temperate coniferous forest'
  | 'Temperate grasslands, savannas and shrublands'
  | 'Tropical and subtropical coniferous forests'
  | 'Tropical and subtropical dry broad leaf forests'
  | 'Tropical and subtropical grasslands, savannas and shrublands'
  | 'Tropical and subtropical moist broad leaf forests'
  | 'Tundra';

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

export function ecosystemTypes(): { label: string; value: EcosystemType }[] {
  return [
    { label: strings.ECOSYSTEM_BOREAL_FOREST_TAIGA, value: 'Boreal forests/Taiga' },
    { label: strings.ECOSYSTEM_DESERT_XERIC_SHRUBLAND, value: 'Deserts and xeric shrublands' },
    { label: strings.ECOSYSTEM_FLOODED_GRASSLAND_SAVANNA, value: 'Flooded grasslands and savannas' },
    { label: strings.ECOSYSTEM_MANGROVE, value: 'Mangroves' },
    { label: strings.ECOSYSTEM_MEDITERRANEAN_FOREST, value: 'Mediterranean forests, woodlands and scrubs' },
    { label: strings.ECOSYSTEM_MONTANE_GRASSLAND_SHRUBLAND, value: 'Montane grasslands and shrublands' },
    { label: strings.ECOSYSTEM_TEMPERATE_BROADLEAF_MIXED_FOREST, value: 'Temperate broad leaf and mixed forests' },
    { label: strings.ECOSYSTEM_TEMPERATE_CONIFEROUS_FOREST, value: 'Temperate coniferous forest' },
    {
      label: strings.ECOSYSTEM_TEMPERATE_GRASSLAND_SAVANNA_SHRUBLAND,
      value: 'Temperate grasslands, savannas and shrublands',
    },
    { label: strings.ECOSYSTEM_TROPICAL_CONIFEROUS_FOREST, value: 'Tropical and subtropical coniferous forests' },
    {
      label: strings.ECOSYSTEM_TROPICAL_DRY_BROADLEAF_FOREST,
      value: 'Tropical and subtropical dry broad leaf forests',
    },
    {
      label: strings.ECOSYSTEM_TROPICAL_GRASSLAND_SAVANNA_SHRUBLAND,
      value: 'Tropical and subtropical grasslands, savannas and shrublands',
    },
    {
      label: strings.ECOSYSTEM_TROPICAL_MOIST_BROADLEAF_FOREST,
      value: 'Tropical and subtropical moist broad leaf forests',
    },
    { label: strings.ECOSYSTEM_TUNDRA, value: 'Tundra' },
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

export const getEcosystemTypesString = (species: Species) => {
  const result =
    species.ecosystemTypes?.map((et) => ecosystemTypes().find((obj) => obj.label === et)?.value ?? '') ?? [];

  return result.filter((str) => str !== '');
};

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

export type SpeciesDetails = components['schemas']['SpeciesLookupDetailsResponsePayload'];
