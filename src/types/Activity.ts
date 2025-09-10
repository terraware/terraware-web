import { components } from 'src/api/types/generated-schema';

export type Activity = {
  createdBy?: number;
  createdTime?: string;
  date: string;
  description?: string;
  id: number;
  isHighlight: boolean;
  isVerified?: boolean;
  media: components['schemas']['ActivityMediaFilePayload'][];
  modifiedBy?: number;
  modifiedTime?: string;
  type: components['schemas']['ActivityPayload']['type'];
  verifiedBy?: number;
  verifiedTime?: string;
};

export type ActivityPayload = components['schemas']['ActivityPayload'];
export type ActivityMediaFile = components['schemas']['ActivityMediaFilePayload'];
export type AdminActivityPayload = components['schemas']['AdminActivityPayload'];

export type MockActivityStatus = 'Changed' | 'Do Not Use' | 'Not Verified' | 'Published' | 'Verified';
