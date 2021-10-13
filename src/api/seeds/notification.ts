import { addQueryParams } from 'src/utils/api';
import axios from '..';
import {
  Notification,
  NotificationMarkAllReadPostResponse,
  NotificationMarkReadPostResponse,
  notificationsEndpoint,
  NotificationsListQuery,
  NotificationsListResponse,
  notificationsMarkAllReadEndpoint,
  notificationsMarkReadEndpoint,
} from '../types/notification';

export const postNotificationAsRead = async (id: string): Promise<NotificationMarkReadPostResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${notificationsMarkReadEndpoint}`.replace('{id}', id);

  const response: NotificationMarkReadPostResponse = (await axios.post(endpoint)).data;

  return response;
};

export const postAllNotificationsAsRead = async (): Promise<NotificationMarkAllReadPostResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${notificationsMarkAllReadEndpoint}`;

  const response: NotificationMarkAllReadPostResponse = (await axios.post(endpoint)).data;

  return response;
};

export const getNotifications = async (facilityId: number): Promise<Notification[]> => {
  const queryParams: NotificationsListQuery = { facilityId };
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${notificationsEndpoint}`;

  const response: NotificationsListResponse = (await axios.get(addQueryParams(endpoint, queryParams))).data;

  return response.notifications;
};
