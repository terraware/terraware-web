import { components } from 'src/api/types/generated-schema';

export type Activity = Omit<
  components['schemas']['AdminActivityPayload'],
  'createdBy' | 'createdTime' | 'isVerified' | 'modifiedBy' | 'modifiedTime'
> & {
  createdBy?: number;
  createdTime?: string;
  isVerified?: boolean;
  media: components['schemas']['ActivityMediaFilePayload'][];
  modifiedBy?: number;
  modifiedTime?: string;
};

export type ActivityPayload = components['schemas']['ActivityPayload'];
export type ActivityMediaFile = components['schemas']['ActivityMediaFilePayload'];
export type AdminActivityPayload = components['schemas']['AdminActivityPayload'];

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
