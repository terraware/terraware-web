import { paths } from './generated-schema';

export const facilitiesEndpoint = '/api/v1/facilities';
export type FacilitiesListResponse =
  paths[typeof facilitiesEndpoint]['get']['responses'][200]['content']['application/json'];

export type FacilityType = FacilitiesListResponse['facilities'][0]['type'];

export interface Facility {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  type: FacilityType;
  connectionState: 'Not Connected' | 'Connected' | 'Configured';
}

export interface StorageLocationDetails {
  storageLocation: string;
  storageCondition: 'Refrigerator' | 'Freezer';
}
