/* eslint-disable no-console */
import axios from 'axios';
import {
  NotificationListResponse,
  SimpleErrorResponsePayload,
  SimpleSuccessResponsePayload,
} from './types/notification';

export const postNotificationAsRead = async (
  id: string
): Promise<SimpleSuccessResponsePayload | SimpleErrorResponsePayload> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/notification/${id}/markRead`;
  return await (await axios.post(endpoint)).data;
};

export const postAllNotificationsAsRead = async (): Promise<
  SimpleSuccessResponsePayload | SimpleErrorResponsePayload
> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/notification/all/markRead`;
  return await (await axios.post(endpoint)).data;
};

export const getNotifications = async (): Promise<NotificationListResponse> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/notification`;
  return await (await axios.get(endpoint)).data;
};
