import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

import { ArrayDeref, NonUndefined } from './utils';

export type Species = {
  id: number;
  commonName?: string;
  conservationCategory?: 'CR' | 'DD' | 'EN' | 'EW' | 'EX' | 'LC' | 'NE' | 'NT' | 'VU';
  familyName?: string;
  growthForms?: GrowthForm[];
  scientificName: string;
  rare?: boolean;
  seedStorageBehavior?: SeedStorageBehavior;
  problems?: SpeciesProblemElement[];
  ecosystemTypes?: EcosystemType[];
  nativeStatus?: NativeStatus;
  nativeEcosystem?: string;
  successionalGroup?: SuccessionalGroup[];
  ecologicalRoleKnown?: string;
  localUsesKnown?: string;
  plantMaterialSourcingMethod?: PlantMaterialSourcingMethod[];
  heightAtMaturity?: number;
  heightAtMaturitySource?: string;
  dbhDiameterAtMaturity?: number;
  dbhSource?: string;
  averageWoodDensity?: number;
  woodDensityLevel?: WoodDensityLevel;
  otherFacts?: string;
};

// TODO: remove this mock data when the actual data is available
export const mockSpeciesNewFieldsData: Partial<Species> = {
  nativeStatus: 'Native',
  nativeEcosystem: 'Tropical and subtropical moist broad leaf forests',
  ecologicalRoleKnown: 'Yes',
  localUsesKnown: 'Yes',
  heightAtMaturity: 10,
  heightAtMaturitySource: 'Source',
  dbhDiameterAtMaturity: 10,
  dbhSource: 'Source',
  averageWoodDensity: 10,
  woodDensityLevel: 'Species',
  otherFacts: 'Other facts',
};

export type WoodDensityLevel = 'Species' | 'Genus' | 'Family';

export type PlantMaterialSourcingMethod = ArrayDeref<
  NonUndefined<components['schemas']['GetSpeciesResponsePayload']['species']['plantMaterialSourcingMethods']>
>;

export type SuccessionalGroup = ArrayDeref<
  NonUndefined<components['schemas']['GetSpeciesResponsePayload']['species']['successionalGroups']>
>;

export type NativeStatus = 'Native' | 'Non-Native';

export type EcosystemType = ArrayDeref<
  NonUndefined<components['schemas']['GetSpeciesResponsePayload']['species']['ecosystemTypes']>
>;

export type GrowthForm = ArrayDeref<
  NonUndefined<components['schemas']['GetSpeciesResponsePayload']['species']['growthForms']>
>;

export type SeedStorageBehavior = NonUndefined<
  components['schemas']['GetSpeciesResponsePayload']['species']['seedStorageBehavior']
>;

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

export function nativeStatuses() {
  return [
    { label: strings.NATIVE, value: 'Native' },
    { label: strings.NON_NATIVE, value: 'Non-Native' },
  ];
}

export function plantMaterialSourcingMethods() {
  return [
    {
      label: strings.PLANT_MATERIAL_SOURCE_METHOD_SEED_COLLECTION_AND_GERMINATION,
      value: 'Seed collection and germination',
    },
    {
      label: strings.PLANT_MATERIAL_SOURCE_METHOD_SEED_PURCHASE_AND_GERMINATION,
      value: 'Seed purchase and germination',
    },
    { label: strings.PLANT_MATERIAL_SOURCE_METHOD_MANGROVE_PROPAGULES, value: 'Mangrove propagules' },
    { label: strings.PLANT_MATERIAL_SOURCE_METHOD_VEGETATIVE_PROPAGATION, value: 'Vegetative propagation' },
    { label: strings.PLANT_MATERIAL_SOURCE_METHOD_WILDLING_HARVEST, value: 'Wildling harvest' },
    { label: strings.PLANT_MATERIAL_SOURCE_METHOD_SEEDLING_PURCHASE, value: 'Seedling purchase' },
    { label: strings.OTHER, value: 'Other' },
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
    { label: strings.MANGROVE, value: 'Mangrove' },
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

export function successionalGroups(): { label: string; value: SuccessionalGroup }[] {
  return [
    { label: strings.SUCCESSIONAL_GROUP_PIONEER, value: 'Pioneer' },
    { label: strings.SUCCESSIONAL_GROUP_EARLY_SECONDARY, value: 'Early secondary' },
    { label: strings.SUCCESSIONAL_GROUP_LATE_SECONDARY, value: 'Late secondary' },
    { label: strings.SUCCESSIONAL_GROUP_MATURE, value: 'Mature' },
  ];
}

export function getGrowthFormString(species: Species): string {
  return (species.growthForms || [])
    .map((growthForm) => {
      switch (growthForm) {
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
        case 'Mangrove':
          return strings.MANGROVE;
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
        default:
          return `${growthForm}`;
      }
    })
    .join(', ');
}

export type SpeciesWithScientificName = Species & {
  scientificName?: string;
};

export type SpeciesById = Map<number, SpeciesWithScientificName>;

export enum SpeciesRequestError {
  PreexistingSpecies = 'A species with that name already exists.',
  // Server returned any other error (3xx, 4xx, 5xxx), or server did not respond, or there was an error
  // setting up the request. In other words, there was a developer error or server outage.
  RequestFailed = 'AN_UNRECOVERABLE_ERROR_OCCURRED',
}

export type SpeciesDetails = components['schemas']['SpeciesLookupDetailsResponsePayload'];

export type SuggestedSpecies = Partial<Species> & { scientificName: string };
