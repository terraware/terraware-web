import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Species = {
  id: number;
  commonName?: string;
  conservationCategory?: 'CR' | 'DD' | 'EN' | 'EW' | 'EX' | 'LC' | 'NE' | 'NT' | 'VU';
  familyName?: string;
  growthForm?: GrowthForm;
  scientificName: string;
  rare?: boolean;
  seedStorageBehavior?: SeedStorageBehavior;
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

export type GrowthForm =
  | 'Tree'
  | 'Shrub'
  | 'Forb'
  | 'Graminoid'
  | 'Fern'
  | 'Fungus'
  | 'Lichen'
  | 'Moss'
  | 'Vine'
  | 'Liana'
  | 'Shrub/Tree'
  | 'Subshrub'
  | 'Multiple Forms';

export type SeedStorageBehavior =
  | 'Intermediate'
  | 'Likely Intermediate'
  | 'Likely Orthodox'
  | 'Likely Recalcitrant'
  | 'Orthodox'
  | 'Recalcitrant'
  | 'Unknown';

export type SpeciesProblemElement = {
  id: number;
  field: 'Scientific Name';
  type: 'Name Misspelled' | 'Name Not Found' | 'Name Is Synonym';
  /** Value for the field in question that would correct the problem. Absent if the system is unable to calculate a corrected value. */
  suggestedValue?: string;
};

export function conservationCategories() {
  return [
    { label: strings.IUCN_EXTINCT, value: 'EX' },
    { label: strings.IUCN_EXTINCT_IN_THE_WILD, value: 'EW' },
    { label: strings.IUCN_CRITICALLY_ENDANGERED, value: 'CR' },
    { label: strings.IUCN_ENDANGERED, value: 'EN' },
    { label: strings.IUCN_VULNERABLE, value: 'VU' },
    { label: strings.IUCN_NEAR_THREATENED, value: 'NT' },
    { label: strings.IUCN_LEAST_CONCERN, value: 'LC' },
    { label: strings.IUCN_DATA_DEFICIENT, value: 'DD' },
    { label: strings.IUCN_NOT_EVALUATED, value: 'NE' },
  ];
}

export function growthForms(activeLocale: string | null) {
  const collator = new Intl.Collator(activeLocale || undefined);

  return [
    { label: strings.FERN, value: 'Fern' },
    { label: strings.FORB, value: 'Forb' },
    { label: strings.FUNGUS, value: 'Fungus' },
    { label: strings.GRAMINOID, value: 'Graminoid' },
    { label: strings.LIANA, value: 'Liana' },
    { label: strings.LICHEN, value: 'Lichen' },
    { label: strings.MOSS, value: 'Moss' },
    { label: strings.MULTIPLE_FORMS, value: 'Multiple Forms' },
    { label: strings.SHRUB, value: 'Shrub' },
    { label: strings.SHRUB_TREE, value: 'Shrub/Tree' },
    { label: strings.SUBSHRUB, value: 'Subshrub' },
    { label: strings.TREE, value: 'Tree' },
    { label: strings.VINE, value: 'Vine' },
  ].sort((a, b) => collator.compare(a.label, b.label));
}

export function storageBehaviors(useLocalizedValues = false) {
  return [
    { label: strings.ORTHODOX, value: useLocalizedValues ? strings.ORTHODOX : 'Orthodox' },
    { label: strings.RECALCITRANT, value: useLocalizedValues ? strings.RECALCITRANT : 'Recalcitrant' },
    { label: strings.INTERMEDIATE, value: useLocalizedValues ? strings.INTERMEDIATE : 'Intermediate' },
    { label: strings.LIKELY_ORTHODOX, value: useLocalizedValues ? strings.LIKELY_ORTHODOX : 'Likely Orthodox' },
    {
      label: strings.LIKELY_RECALCITRANT,
      value: useLocalizedValues ? strings.LIKELY_RECALCITRANT : 'Likely Recalcitrant',
    },
    {
      label: strings.LIKELY_INTERMEDIATE,
      value: useLocalizedValues ? strings.LIKELY_INTERMEDIATE : 'Likely Intermediate',
    },
    { label: strings.UNKNOWN, value: useLocalizedValues ? strings.UNKNOWN : 'Unknown' },
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
      case 'Fungus':
        return strings.FUNGUS;
      case 'Graminoid':
        return strings.GRAMINOID;
      case 'Liana':
        return strings.LIANA;
      case 'Lichen':
        return strings.LICHEN;
      case 'Moss':
        return strings.MOSS;
      case 'Multiple Forms':
        return strings.MULTIPLE_FORMS;
      case 'Shrub':
        return strings.SHRUB;
      case 'Shrub/Tree':
        return strings.SHRUB_TREE;
      case 'Subshrub':
        return strings.SUBSHRUB;
      case 'Tree':
        return strings.TREE;
      case 'Vine':
        return strings.VINE;
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

export type SpeciesDetails = components['schemas']['SpeciesLookupDetailsResponsePayload'];
