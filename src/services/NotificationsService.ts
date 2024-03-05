import { paths } from 'src/api/types/generated-schema';
import { Notifications, NotificationsCount } from 'src/types/Notifications';

import HttpService, { Params, Response } from './HttpService';

/**
 * In-App notifications related functionality
 */

const NOTIFICATIONS_ENDPOINT = '/api/v1/notifications';
const NOTIFICATIONS_READ_ENDPOINT = '/api/v1/notifications/{id}';
const NOTIFICATIONS_COUNT_ENDPOINT = '/api/v1/notifications/count';

/**
 * Exported types
 */
export type NotificationsResponse = Response & Notifications;
export type NotificationsCountResponse = Response & NotificationsCount;
export type MarkNotificationReadResponse = {
  id: number;
} & Response;

type ListNotificationsResponse =
  paths[typeof NOTIFICATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ListNotificationsCountResponse =
  paths[typeof NOTIFICATIONS_COUNT_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpNotifications = HttpService.root(NOTIFICATIONS_ENDPOINT);
const httpNotificationsRead = HttpService.root(NOTIFICATIONS_READ_ENDPOINT);
const httpNotificationsCount = HttpService.root(NOTIFICATIONS_COUNT_ENDPOINT);

/**
 * get notifications
 */
const getNotifications = async (organizationId?: number): Promise<NotificationsResponse> => {
  const params: Params = {};
  if (organizationId) {
    params.organizationId = organizationId.toString();
  }

  const response: NotificationsResponse = await httpNotifications.get<ListNotificationsResponse, Notifications>(
    { params },
    (data) => ({ items: data?.notifications ?? [] })
  );

  return response;
};

/**
 * Get notifications unread count
 */
const getNotificationsUnreadCount = async (): Promise<NotificationsCountResponse> => {
  const response: NotificationsCountResponse = await httpNotificationsCount.get<
    ListNotificationsCountResponse,
    NotificationsCount
  >({}, (data) => ({ counts: data?.notifications ?? [] }));

  return response;
};

/**
 * Mark a notification as read or unread
 */
const markNotificationRead = async (read: boolean, id: number): Promise<MarkNotificationReadResponse> => {
  const response: Response = await httpNotificationsRead.put({
    urlReplacements: {
      '{id}': id.toString(),
    },
    entity: { read },
  });

  return { ...response, id };
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsRead = async (read: boolean, organizationId?: number): Promise<Response> => {
  return await httpNotifications.put({
    entity: {
      read,
      organizationId,
    },
  });
};

/**
 * Export functions
 */
const NotificationsService = {
  getNotifications,
  getNotificationsUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};

export default NotificationsService;
