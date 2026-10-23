import { SubLocationPayload } from 'src/queries/generated/facilities';
import { FacilityPayload, Point } from 'src/queries/generated/organizations';
import strings from 'src/strings';

export type SubLocation = SubLocationPayload;

export type PartialSubLocation = Partial<SubLocation>;

export type FacilityType = FacilityPayload['type'];

type FacilityLocation = Point;

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
  location?: FacilityLocation;
}

export const DEFAULT_SUB_LOCATIONS = (): string[] => [
  strings.FREEZER_1,
  strings.FREEZER_2,
  strings.FREEZER_3,
  strings.REFRIGERATOR_1,
  strings.REFRIGERATOR_2,
  strings.REFRIGERATOR_3,
];
