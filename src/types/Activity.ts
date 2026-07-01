import { theme } from '@terraware/web-components';

import {
  ActivityMediaFilePayload,
  AdminActivityMediaFilePayload,
  ActivityPayload as RtkActivityPayload,
  AdminActivityPayload as RtkAdminActivityPayload,
  AdminCreateActivityRequestPayload as RtkAdminCreateActivityRequestPayload,
  CreateActivityRequestPayload as RtkCreateActivityRequestPayload,
  UpdateActivityMediaRequestPayload as RtkUpdateActivityMediaRequestPayload,
  UpdateActivityRequestPayload as RtkUpdateActivityRequestPayload,
} from 'src/queries/generated/activities';
import defaultStrings from 'src/strings';

export type Activity = Omit<
  RtkAdminActivityPayload,
  'createdBy' | 'createdTime' | 'isVerified' | 'modifiedBy' | 'modifiedTime'
> & {
  createdBy?: number;
  createdTime?: string;
  isVerified?: boolean;
  media: (Omit<AdminActivityMediaFilePayload, 'createdBy' | 'createdTime'> & {
    createdBy?: number;
    createdTime?: string;
  })[];
  modifiedBy?: number;
  modifiedTime?: string;
};

export type ActivityPayload = RtkActivityPayload;
export type ActivityMediaFile = ActivityMediaFilePayload;
export type AdminActivityPayload = RtkAdminActivityPayload;
export type AdminActivityMediaFile = AdminActivityMediaFilePayload;
export type AdminCreateActivityRequestPayload = RtkAdminCreateActivityRequestPayload;
export type CreateActivityRequestPayload = RtkCreateActivityRequestPayload;
export type UpdateActivityRequestPayload = RtkUpdateActivityRequestPayload;
export type UpdateActivityMediaRequestPayload = RtkUpdateActivityMediaRequestPayload;

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

export type ActivityStatusTag = ActivityStatus | 'Unpublished Changes' | 'Published' | 'Project Updated';

export const activityStatusTagLabel = (
  status: ActivityStatusTag | 'Unpublished Changes' | 'Published',
  strings: typeof defaultStrings
) => {
  switch (status) {
    case 'Not Verified':
      return strings.NOT_VERIFIED;
    case 'Verified':
      return strings.VERIFIED;
    case 'Do Not Use':
      return strings.DO_NOT_USE;
    case 'Unpublished Changes':
      return strings.UNPUBLISHED_CHANGES;
    case 'Published':
      return strings.PUBLISHED;
    case 'Project Updated':
      return strings.PROJECT_UPDATED;
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
      return strings.SOCIAL_IMPACT;
    case 'Others':
      return strings.OTHERS;
  }
};
