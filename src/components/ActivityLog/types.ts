import { ActivityPayload, AdminActivityPayload } from 'src/types/Activity';
import { FunderActivity } from 'src/types/FunderActivity';

export type TypedActivity =
  | {
      type: 'admin';
      payload: AdminActivityPayload;
    }
  | {
      type: 'base';
      payload: ActivityPayload;
    }
  | {
      type: 'funder';
      payload: FunderActivity;
    };
