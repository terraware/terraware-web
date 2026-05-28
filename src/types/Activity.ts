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

// All three observation media payload variants (Activity, Admin, Funder) are structurally identical;
// we alias one of them as the canonical type for the shared helpers below.
export type ObservationActivityMedia = components['schemas']['AdminActivityObservationMediaFilePayload'];

/**
 * Returns true when the activity was automatically created from a TW observation.
 * Use this (not `type === 'Monitoring'`) to gate observation-specific behavior — users can
 * also create Monitoring activities manually, which should not be treated as observation activities.
 */
export const isObservationActivity = (activity: {
  observation?: { observationId?: number };
}): activity is typeof activity & { observation: { observationId: number } } =>
  activity.observation?.observationId !== undefined;

/** Returns true when the given activity media file originated from an observation. */
export const isObservationMedia = (media: {
  observation?: ObservationActivityMedia;
}): media is typeof media & { observation: ObservationActivityMedia } => media.observation !== undefined;

/** Returns true for corner photos (position is set). Corner captions are read-only and undeletable. */
export const isCornerPhoto = (media: { observation?: ObservationActivityMedia }): boolean =>
  media.observation?.position !== undefined;

/**
 * Returns true for media types that cannot be deleted per PRD: corner, quadrat, and soil photos.
 * Plot-type photos without a corner position may be deletable depending on whether they were
 * uploaded as part of the original observation (determined from observation results by fileId).
 */
export const isUndeletableObservationPhoto = (media: { observation?: ObservationActivityMedia }): boolean => {
  if (!media.observation) {
    return false;
  }
  return (
    media.observation.position !== undefined ||
    media.observation.type === 'Quadrat' ||
    media.observation.type === 'Soil'
  );
};

/**
 * Returns true for media types whose captions are not editable per PRD: corner and quadrat photos.
 * Soil and plot-type photos have editable captions.
 */
export const isCaptionReadOnly = (media: { observation?: ObservationActivityMedia }): boolean => {
  if (!media.observation) {
    return false;
  }
  return media.observation.position !== undefined || media.observation.type === 'Quadrat';
};
