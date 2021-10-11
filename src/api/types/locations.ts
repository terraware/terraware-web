import { paths } from './generated-schema';

export const storageLocationEndpoint = '/api/v1/seedbank/values/storageLocation/{facilityId}';
export type StorageLocationListResponse = paths[typeof storageLocationEndpoint]['get']['responses'][200]['content']['application/json'];
export type StorageLocation = StorageLocationListResponse['locations'][0];
export type ConditionType = StorageLocation['storageCondition'];
