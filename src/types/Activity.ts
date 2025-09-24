import { components } from 'src/api/types/generated-schema';
import defaultStrings from 'src/strings';

export type Activity = Omit<
  components['schemas']['AdminActivityPayload'],
  'createdBy' | 'createdTime' | 'isVerified' | 'modifiedBy' | 'modifiedTime'
> & {
  createdBy?: number;
  createdTime?: string;
  isVerified?: boolean;
  media: (Omit<components['schemas']['AdminActivityMediaFilePayload'], 'createdBy' | 'createdTime'> & {
    createdBy?: number;
    createdTime?: string;
  })[];
  modifiedBy?: number;
  modifiedTime?: string;
};

export type ActivityPayload = components['schemas']['ActivityPayload'];
export type ActivityMediaFile = components['schemas']['ActivityMediaFilePayload'];
export type AdminActivityPayload = components['schemas']['AdminActivityPayload'];
export type AdminActivityMediaFile = components['schemas']['AdminActivityMediaFilePayload'];
export type AdminCreateActivityRequestPayload = components['schemas']['AdminCreateActivityRequestPayload'];
export type CreateActivityRequestPayload = components['schemas']['CreateActivityRequestPayload'];
export type UpdateActivityRequestPayload = components['schemas']['UpdateActivityRequestPayload'];

export type ActivityType = Activity['type'];
export const ACTIVITY_TYPES: ActivityType[] = [
  'Drone Flight',
  'Monitoring',
  'Nursery',
  'Planting',
  'Seed Collection',
  'Site Visit',
  'Stakeholder Engagement',
];

export const activityTypeLabel = (activityType: ActivityType, strings: typeof defaultStrings) => {
  switch (activityType) {
    case 'Drone Flight':
      return strings.DRONE_FLIGHT;
    case 'Monitoring':
      return strings.MONITORING;
    case 'Nursery':
      return strings.NURSERY;
    case 'Planting':
      return strings.PLANTING;
    case 'Seed Collection':
      return strings.SEED_COLLECTION;
    case 'Site Visit':
      return strings.SITE_VISIT;
    case 'Stakeholder Engagement':
      return strings.STAKEHOLDER_ENGAGEMENT;
    default:
      return '';
  }
};

export type MockActivityStatus = 'Changed' | 'Do Not Use' | 'Not Verified' | 'Published' | 'Verified';
