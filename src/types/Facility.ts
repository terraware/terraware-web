import { paths, components } from 'src/api/types/generated-schema';

const schemas = 'schemas';

export type StorageLocationDetails = components[typeof schemas]['StorageLocationDetails'];

export type FacilityType = components[typeof schemas]['FacilityPayload']['type'];

export interface Facility {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  type: FacilityType;
  connectionState: 'Not Connected' | 'Connected' | 'Configured';
  timeZone?: string;
}
