import { components } from './generated-schema-seedbank';

export type Notifications = components['schemas']['NotificationListResponse']['notifications'];
export type NotificationList = components['schemas']['NotificationPayload'][];
export type NotificationType = components['schemas']['NotificationPayload']['type'];
