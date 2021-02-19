import { components } from './generated-schema';

export type Locations = components['schemas']['StorageLocationsResponsePayload']['locations'];

export type Location = components['schemas']['StorageLocationDetails'];

export type ConditionType = components['schemas']['StorageLocationDetails']['storageCondition'];

export const STORAGE_CONDITION: ConditionType[] = ['Refrigerator', 'Freezer'];
