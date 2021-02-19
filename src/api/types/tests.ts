import { components } from './generated-schema';

export type GerminationTests = components['schemas']['AccessionPayload']['germinationTests'];

export type GerminationTest = components['schemas']['GerminationTestPayload'];

export type Germination = components['schemas']['GerminationPayload'];

export type GerminationKey = keyof Germination;

export type GerminationTestType = GerminationTest['testType'];

export type GerminationSeedType = NonNullable<GerminationTest['seedType']>;

export type GerminationTreatment = NonNullable<GerminationTest['treatment']>;

export type GerminationSubstrate = NonNullable<GerminationTest['substrate']>;

export const GERMINATION_TEST_TYPES: GerminationTestType[] = ['Lab', 'Nursery'];

export const GERMINATION_SEED_TYPES: GerminationSeedType[] = [
  'Fresh',
  'Stored',
];

export const GERMINATION_TREATMENTS: GerminationTreatment[] = [
  'Soak',
  'Scarify',
  'GA3',
  'Stratification',
  'Other',
];

export const GERMINATION_SUBASTRATES: GerminationSubstrate[] = [
  'Other',
  'Nursery Media',
  'Agar Petri Dish',
  'Paper Petri Dish',
];
