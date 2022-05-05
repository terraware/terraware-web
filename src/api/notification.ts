import addQueryParams from 'src/api/helpers/addQueryParams';
import { paths } from 'src/api/types/generated-schema';
import axios from './index';
import { Notifications, NotificationsCount } from 'src/types/Notifications';

/*
 * All functions in this module ALWAYS return a promise that resolves. The caller must examine
 * the return value to check that the request was successful.
 */

const NOTIFICATIONS_ENDPOINT = '/api/v1/notifications';
type ListNotificationsQuery = paths[typeof NOTIFICATIONS_ENDPOINT]['get']['parameters']['query'];
type ListNotificationsResponse =
  paths[typeof NOTIFICATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListNotificationsResponseElement = ListNotificationsResponse['notifications'][0];

export const getNotifications = async (organizationId?: number): Promise<Notifications> => {
  const response: Notifications = { items: [], errorOccurred: false };

  try {
    const queryParams: ListNotificationsQuery = { organizationId };
    let endpoint = NOTIFICATIONS_ENDPOINT;
    endpoint = addQueryParams(endpoint, queryParams);
    const notifications: ListNotificationsResponseElement[] = (await axios.get(endpoint)).data.notifications;
    response.items = notifications;
  } catch {
    // Do not return a partially filled list of notifications.
    response.items = [];
    response.errorOccurred = true;
  }

  return response;
};

const MARK_READ_ENDPOINT = '/api/v1/notifications/{id}';

type MarkNotificationReadResponse = {
  id: number;
  errorOccurred: boolean;
};

export const MarkNotificationRead = async (read: boolean, id: number): Promise<MarkNotificationReadResponse> => {
  const response: MarkNotificationReadResponse = { id, errorOccurred: false };

  try {
    const endpoint = MARK_READ_ENDPOINT.replace('{id}', `${id}`);
    await axios.put(endpoint, { read });
  } catch (error) {
    response.errorOccurred = true;
  }

  return response;
};

const MARK_ALL_READ_ENDPOINT = '/api/v1/notifications';

type MarkAllNotificationsReadResponse = {
  errorOccurred: boolean;
};

export const MarkAllNotificationsRead = async (
  read: boolean,
  organizationId?: number
): Promise<MarkAllNotificationsReadResponse> => {
  const response: MarkAllNotificationsReadResponse = { errorOccurred: false };

  try {
    await axios.put(MARK_ALL_READ_ENDPOINT, { organizationId, read });
  } catch (error) {
    response.errorOccurred = true;
  }

  return response;
};

const COUNT_ENDPOINT = '/api/v1/notifications/count';
type ListNotificationsCountResponse =
  paths[typeof COUNT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListNotificationsCountResponseElement = ListNotificationsCountResponse['notifications'][0];

export const unreadCount = async (): Promise<NotificationsCount> => {
  const response: NotificationsCount = { items: [], errorOccurred: false };

  try {
    const endpoint = COUNT_ENDPOINT;
    const notifications: ListNotificationsCountResponseElement[] = (await axios.get(endpoint)).data.notifications;
    response.items = notifications;
  } catch {
    // Do not return a partially filled list of notifications.
    response.items = [];
    response.errorOccurred = true;
  }

  return response;
};
