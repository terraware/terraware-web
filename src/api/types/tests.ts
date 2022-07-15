import { components } from './generated-schema';

export type GerminationTests = components['schemas']['AccessionPayload']['germinationTests'];

export type GerminationTest = components['schemas']['ViabilityTestPayload'];

export type Germination = components['schemas']['ViabilityTestResultPayload'];

export type GerminationKey = keyof Germination;
