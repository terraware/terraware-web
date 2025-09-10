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
