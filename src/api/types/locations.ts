import { components } from './generated-schema-seedbank';

export type Locations = components['schemas']['StorageLocationsResponsePayload']['locations'];

export type Location = components['schemas']['StorageLocationDetails'];

export type ConditionType = components['schemas']['StorageLocationDetails']['storageCondition'];
