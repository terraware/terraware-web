import { theme } from '@terraware/web-components';

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
export type UpdateActivityMediaRequestPayload = components['schemas']['UpdateActivityMediaRequestPayload'];

export type ActivityType = Activity['type'];
export const ACTIVITY_TYPES: ActivityType[] = [
  'Drone Flight',
  'Monitoring',
  'Nursery and Propagule Operations',
  'Planting',
  'Seed Collection',
  'Site Visit',
  'Social Impact',
  'Others',
];

export type ActivityStatus = Activity['status'];
export const ACTIVITY_STATUSES: ActivityStatus[] = ['Verified', 'Not Verified', 'Do Not Use'];

export const activityTypeColor = (type: ActivityType): string => {
  switch (type) {
    case 'Seed Collection':
      return theme.palette.TwClrBasePink300 as string;
    case 'Nursery and Propagule Operations':
      return theme.palette.TwClrBaseBlue600 as string;
    case 'Planting':
      return theme.palette.TwClrBaseGreen400 as string;
    case 'Monitoring':
      return theme.palette.TwClrBaseBlue300 as string;
    case 'Site Visit':
      return theme.palette.TwClrBaseOrange400 as string;
    case 'Social Impact':
      return theme.palette.TwClrBaseYellow200 as string;
    case 'Drone Flight':
      return theme.palette.TwClrBaseRed500 as string;
    case 'Others':
      return theme.palette.TwClrBaseBlack as string;
  }
};

export type ActivityStatusTag = ActivityStatus | 'Changed' | 'Published';

export const activityStatusTagLabel = (
  status: ActivityStatusTag | 'Changed' | 'Published',
  strings: typeof defaultStrings
) => {
  switch (status) {
    case 'Not Verified':
      return strings.NOT_VERIFIED;
    case 'Verified':
      return strings.VERIFIED;
    case 'Do Not Use':
      return strings.DO_NOT_USE;
    case 'Changed':
      return strings.CHANGED;
    case 'Published':
      return strings.PUBLISHED;
  }
};

export const activityTypeLabel = (activityType: ActivityType, strings: typeof defaultStrings): string => {
  switch (activityType) {
    case 'Drone Flight':
      return strings.DRONE_FLIGHT;
    case 'Monitoring':
      return strings.MONITORING;
    case 'Nursery and Propagule Operations':
      return strings.NURSERY_AND_PROPAGULE_OPERATIONS;
    case 'Planting':
      return strings.PLANTING;
    case 'Seed Collection':
      return strings.SEED_COLLECTION;
    case 'Site Visit':
      return strings.SITE_VISIT;
    case 'Social Impact':
      return strings.STAKEHOLDER_ENGAGEMENT;
    case 'Others':
      return strings.OTHERS;
  }
};
