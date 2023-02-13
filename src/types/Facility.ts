import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

const schemas = 'schemas';

export type StorageLocation = components[typeof schemas]['StorageLocationPayload'];

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

export const ActiveStatuses = () => [
  strings.AWAITING_CHECK_IN,
  strings.PENDING,
  strings.AWAITING_PROCESSING,
  strings.PROCESSING,
  strings.PROCESSED,
  strings.DRYING,
  strings.DRIED,
  strings.IN_STORAGE,
];
