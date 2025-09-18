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

export const MOCK_ACTIVITIES: Activity[] = [
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so...',
    id: 1,
    isHighlight: false,
    isVerified: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Nursery',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so... ',
    id: 2,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-21',
    description: 'Trees planted in the north zone',
    id: 3,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Site Visit',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-20',
    description: 'Trees planted in the north zone',
    id: 4,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-17',
    description: 'Trees planted in the north zone',
    id: 5,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-06',
    description: 'Trees planted in the north zone',
    id: 6,
    isHighlight: false,
    isVerified: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Site Visit',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-24',
    description: 'Trees planted in the north zone',
    id: 7,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Seed Collection',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-21',
    description: 'Trees planted in the north zone',
    id: 8,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-19',
    description: 'Trees planted in the north zone',
    id: 9,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-07',
    description: 'Trees planted in the north zone',
    id: 10,
    isHighlight: false,
    isVerified: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
  },
];
