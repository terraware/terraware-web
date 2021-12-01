import addQueryParams from 'src/api/addQueryParams';
import { paths } from 'src/api/types/generated-schema';
import axios from '..';
import { Notifications, NotificationTypes } from 'src/types/Notifications';

/*
 * All functions in this module ALWAYS return a promise that resolves. The caller must examine
 * the return value to check that the request was successful.
 */

const NOTIFICATIONS_ENDPOINT = '/api/v1/seedbank/notification';
type ListNotificationsQuery = paths[typeof NOTIFICATIONS_ENDPOINT]['get']['parameters']['query'];
type ListNotificationsResponse =
  paths[typeof NOTIFICATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListNotificationsResponseElement = ListNotificationsResponse['notifications'][0];

export const getNotifications = async (facilityId: number): Promise<Notifications> => {
  const response: Notifications = { items: [], errorOccurred: false };

  try {
    const queryParams: ListNotificationsQuery = { facilityId };
    let endpoint = `${process.env.REACT_APP_TERRAWARE_API}${NOTIFICATIONS_ENDPOINT}`;
    endpoint = addQueryParams(endpoint, queryParams);
    const notifications: ListNotificationsResponseElement[] = (await axios.get(endpoint)).data.notifications;
    notifications.forEach((notification: ListNotificationsResponseElement) => {
      response.items.push({
        id: notification.id,
        timestamp: notification.timestamp,
        type: NotificationTypes[notification.type],
        read: notification.read,
        text: notification.text,
        accessionId: notification.accessionId,
        state: notification.state,
      });
    });
  } catch {
    // Do not return a partially filled list of notifications.
    response.items = [];
    response.errorOccurred = true;
  }

  return response;
};

const MARK_READ_ENDPOINT = '/api/v1/seedbank/notification/{id}/markRead';

type MarkNotificationReadResponse = {
  id: string;
  errorOccurred: boolean;
};

export const MarkNotificationRead = async (id: string): Promise<MarkNotificationReadResponse> => {
  const response: MarkNotificationReadResponse = { id, errorOccurred: false };

  try {
    const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${MARK_READ_ENDPOINT}`.replace('{id}', id);
    await axios.post(endpoint);
  } catch (error) {
    response.errorOccurred = true;
  }

  return response;
};

const MARK_ALL_READ_ENDPOINT = '/api/v1/seedbank/notification/all/markRead';

type MarkAllNotificationsReadResponse = {
  errorOccurred: boolean;
};

export const MarkAllNotificationsRead = async (): Promise<MarkAllNotificationsReadResponse> => {
  const response: MarkAllNotificationsReadResponse = { errorOccurred: false };

  try {
    const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${MARK_ALL_READ_ENDPOINT}`;
    await axios.post(endpoint);
  } catch (error) {
    response.errorOccurred = true;
  }

  return response;
};
