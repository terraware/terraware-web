import axios from '..';
import {
  SimpleErrorResponsePayload,
  SimpleSuccessResponsePayload,
} from '../types';
import { Notifications } from '../types/notification';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/seedbank/notification`;

export const postNotificationAsRead = async (
  id: string
): Promise<SimpleSuccessResponsePayload | SimpleErrorResponsePayload> => {
  const endpoint = `${BASE_URL}/${id}/markRead`;

  return (await axios.post(endpoint)).data;
};

export const postAllNotificationsAsRead =
  async (): Promise<SimpleSuccessResponsePayload> => {
    const endpoint = `${BASE_URL}/all/markRead`;

    return (await axios.post(endpoint)).data;
  };

export const getNotifications = async (
  facilityId: number
): Promise<Notifications> => {
  const endpoint = `${BASE_URL}?facilityId=${facilityId}`;

  return (await axios.get(endpoint)).data.notifications;
};
