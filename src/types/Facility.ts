import strings from 'src/strings';
import { components } from 'src/api/types/generated-schema';

export type SubLocation = components['schemas']['SubLocationPayload'];

export type PartialSubLocation = Partial<SubLocation>;

export type FacilityType = components['schemas']['FacilityPayload']['type'];

export interface Facility {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  type: FacilityType;
  connectionState: 'Not Connected' | 'Connected' | 'Configured';
  timeZone?: string;
  buildStartedDate?: string;
  buildCompletedDate?: string;
  operationStartedDate?: string;
  capacity?: number;
}

export const DEFAULT_SUB_LOCATIONS = (): string[] => [
  strings.FREEZER_1,
  strings.FREEZER_2,
  strings.FREEZER_3,
  strings.REFRIGERATOR_1,
  strings.REFRIGERATOR_2,
  strings.REFRIGERATOR_3,
];
