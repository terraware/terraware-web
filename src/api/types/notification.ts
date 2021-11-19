import { paths } from './generated-schema';

export const notificationsEndpoint = '/api/v1/seedbank/notification';
export type NotificationsListQuery = paths[typeof notificationsEndpoint]['get']['parameters']['query'];
export type NotificationsListResponse =
  paths[typeof notificationsEndpoint]['get']['responses'][200]['content']['application/json'];
export type Notification = NotificationsListResponse['notifications'][0];

export const notificationsMarkReadEndpoint = '/api/v1/seedbank/notification/{id}/markRead';
export type NotificationMarkReadPostResponse =
  paths[typeof notificationsMarkAllReadEndpoint]['post']['responses'][200]['content']['application/json'];

export const notificationsMarkAllReadEndpoint = '/api/v1/seedbank/notification/all/markRead';
export type NotificationMarkAllReadPostResponse =
  paths[typeof notificationsMarkAllReadEndpoint]['post']['responses'][200]['content']['application/json'];

export type NotificationType = Notification['type'];
