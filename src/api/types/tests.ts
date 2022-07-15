import { components } from './generated-schema';

export type ViabilityTests = components['schemas']['AccessionPayload']['viabilityTests'];

export type ViabilityTest = components['schemas']['ViabilityTestPayload'];

export type ViabilityTestResult = components['schemas']['ViabilityTestResultPayload'];

export type ViabilityTestResultKey = keyof ViabilityTestResult;
