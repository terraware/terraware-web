import { components } from './generated-schema';

export const accessionEndpoint = '/api/v1/seedbank/accessions/{id}';

export const checkInEndpoint = '/api/v1/seedbank/accessions/{id}/checkIn';

export const schemas = 'schemas';
export type Geolocation = components[typeof schemas]['Geolocation'];
export type ViabilityTest = components[typeof schemas]['GetViabilityTestPayload'];
export type TestResult = Required<components[typeof schemas]['GetViabilityTestPayload']>['testResults'][0];
