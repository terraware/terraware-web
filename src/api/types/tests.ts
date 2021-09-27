import { components } from './generated-schema-seedbank';

export type GerminationTests = components['schemas']['AccessionPayload']['germinationTests'];

export type GerminationTest = components['schemas']['GerminationTestPayload'];

export type Germination = components['schemas']['GerminationPayload'];

export type GerminationKey = keyof Germination;
