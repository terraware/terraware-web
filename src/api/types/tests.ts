import { components } from './generated-schema';

export type GerminationTests = components['schemas']['AccessionPayload']['germinationTests'];

export type GerminationTest = components['schemas']['GerminationTestPayload'];

export type Germination = components['schemas']['GerminationPayload'];

export type GerminationKey = keyof Germination;
