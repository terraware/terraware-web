/* eslint-disable no-console */
import axios from 'axios';
import { operations } from './types/generated-schema';

type MarkAllRead = operations["markAllRead"];
type MarkRead = operations["markRead"];
type ListAll = operations["listAll"];

export const postNotificationAsRead = async (
  id: string
): Promise<MarkRead["responses"]["200"]["content"]["application/json"] | MarkRead["responses"]["404"]["content"]["application/json"]> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/notification/${id}/markRead`;
  return await (await axios.post(endpoint)).data;
};

export const postAllNotificationsAsRead = async (): Promise<
  MarkAllRead["responses"]["200"]["content"]["application/json"]
> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/notification/all/markRead`;
  return await (await axios.post(endpoint)).data;
};

export const getNotifications = async (): Promise<ListAll["responses"]["200"]["content"]["application/json"]> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/notification`;
  return await (await axios.get(endpoint)).data;
};
